"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var TenancyCoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenancyCoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("mongoose");
const tenancy_constants_1 = require("./tenancy.constants");
let TenancyCoreModule = TenancyCoreModule_1 = class TenancyCoreModule {
    static register(options) {
        const tenancyModuleOptionsProvider = {
            provide: tenancy_constants_1.TENANT_MODULE_OPTIONS,
            useValue: Object.assign({}, options),
        };
        const connectionMapProvider = this.createConnectionMapProvider();
        const modelDefinitionMapProvider = this.createModelDefinitionMapProvider();
        const tenantContextProvider = this.createTenantContextProvider();
        const httpAdapterHost = this.createHttpAdapterProvider();
        const baseConnectionMapProvider = this.createBaseConnectionMapProvider();
        const tenantConnectionProvider = this.createTenantConnectionProvider();
        const providers = [
            tenancyModuleOptionsProvider,
            tenantContextProvider,
            connectionMapProvider,
            modelDefinitionMapProvider,
            baseConnectionMapProvider,
            tenantConnectionProvider,
            httpAdapterHost,
        ];
        return {
            module: TenancyCoreModule_1,
            providers,
            exports: providers,
        };
    }
    static registerAsync(options) {
        const connectionMapProvider = this.createConnectionMapProvider();
        const modelDefinitionMapProvider = this.createModelDefinitionMapProvider();
        const tenantContextProvider = this.createTenantContextProvider();
        const httpAdapterHost = this.createHttpAdapterProvider();
        const baseConnectionMapProvider = this.createBaseConnectionMapProvider();
        const tenantConnectionProvider = this.createTenantConnectionProvider();
        const asyncProviders = this.createAsyncProviders(options);
        const providers = [
            ...asyncProviders,
            tenantContextProvider,
            connectionMapProvider,
            modelDefinitionMapProvider,
            baseConnectionMapProvider,
            tenantConnectionProvider,
            httpAdapterHost,
        ];
        return {
            module: TenancyCoreModule_1,
            imports: options.imports,
            providers: providers,
            exports: providers,
        };
    }
    onApplicationShutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            if (TenancyCoreModule_1.baseConnectionMapInstance) {
                yield Promise.all([...TenancyCoreModule_1.baseConnectionMapInstance.values()].map((connection) => connection.close()));
            }
        });
    }
    static getTenant(req, moduleOptions, adapterHost) {
        const isFastifyAdaptor = this.adapterIsFastify(adapterHost);
        if (!moduleOptions) {
            throw new common_1.BadRequestException(`Tenant options are mandatory`);
        }
        const { tenantIdentifier = null, isTenantFromSubdomain = false } = moduleOptions;
        if (isTenantFromSubdomain) {
            return this.getTenantFromSubdomain(isFastifyAdaptor, req);
        }
        else {
            if (!tenantIdentifier) {
                throw new common_1.BadRequestException(`${tenantIdentifier} is mandatory`);
            }
            return this.getTenantFromRequest(isFastifyAdaptor, req, tenantIdentifier);
        }
    }
    static getTenantFromRequest(isFastifyAdaptor, req, tenantIdentifier) {
        var _a;
        let tenantId = '';
        if (isFastifyAdaptor) {
            tenantId =
                ((_a = req.headers[`${tenantIdentifier || ''}`.toLowerCase()]) === null || _a === void 0 ? void 0 : _a.toString()) ||
                    '';
        }
        else {
            tenantId = req.get(`${tenantIdentifier}`) || '';
        }
        if (this.isEmpty(tenantId)) {
            throw new common_1.BadRequestException(`${tenantIdentifier} is not supplied`);
        }
        return tenantId;
    }
    static getTenantFromSubdomain(isFastifyAdaptor, req) {
        let tenantId = '';
        if (isFastifyAdaptor) {
            const subdomains = this.getSubdomainsForFastify(req);
            if (subdomains instanceof Array && subdomains.length > 0) {
                tenantId = subdomains[subdomains.length - 1];
            }
        }
        else {
            if (req.subdomains instanceof Array && req.subdomains.length > 0) {
                tenantId = req.subdomains[req.subdomains.length - 1];
            }
        }
        if (this.isEmpty(tenantId)) {
            throw new common_1.BadRequestException(`Tenant ID is mandatory`);
        }
        return tenantId;
    }
    static getConnection(tenantId, moduleOptions, baseConnMap, connMap, modelDefMap) {
        return __awaiter(this, void 0, void 0, function* () {
            if (moduleOptions.validator) {
                yield moduleOptions.validator(tenantId).validate();
            }
            const exists = connMap.has(tenantId);
            if (exists) {
                const connection = connMap.get(tenantId);
                const registeredCount = Object.keys(connection.models).length;
                if (registeredCount < modelDefMap.size) {
                    modelDefMap.forEach((definition) => {
                        const { name, schema, collection } = definition;
                        if (!connection.models[name]) {
                            connection.model(name, schema, collection);
                        }
                    });
                }
                if (moduleOptions.forceCreateCollections) {
                    yield Promise.all(Object.entries(connection.models).map(([, m]) => m.createCollection()));
                }
                return connection;
            }
            const pendingTenantConn = this.pendingTenantConnections.get(tenantId);
            if (pendingTenantConn) {
                return yield pendingTenantConn;
            }
            const tenantConnectionPromise = this.createTenantConnection(tenantId, moduleOptions, baseConnMap, connMap, modelDefMap);
            this.pendingTenantConnections.set(tenantId, tenantConnectionPromise);
            try {
                return yield tenantConnectionPromise;
            }
            finally {
                this.pendingTenantConnections.delete(tenantId);
            }
        });
    }
    static createTenantConnection(tenantId, moduleOptions, baseConnMap, connMap, modelDefMap) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield Promise.resolve(moduleOptions.uri(tenantId));
            const baseUri = this.extractBaseUri(uri);
            const dbName = this.extractDatabaseName(uri, tenantId);
            let baseConnection = baseConnMap.get(baseUri);
            const needsReconnection = baseConnection &&
                (baseConnection.readyState === 0 ||
                    baseConnection.readyState === 3 ||
                    baseConnection.readyState === 99);
            if (!baseConnection || needsReconnection) {
                const pendingConnection = this.pendingConnections.get(baseUri);
                if (pendingConnection) {
                    baseConnection = yield pendingConnection;
                }
                else {
                    const connectionPromise = this.createBaseConnection(uri, baseUri, moduleOptions, baseConnMap, connMap, needsReconnection);
                    this.pendingConnections.set(baseUri, connectionPromise);
                    try {
                        baseConnection = yield connectionPromise;
                    }
                    finally {
                        this.pendingConnections.delete(baseUri);
                    }
                }
            }
            const connection = baseConnection.useDb(dbName);
            const modelPromises = [];
            modelDefMap.forEach((definition) => {
                const { name, schema, collection } = definition;
                const modelCreated = connection.model(name, schema, collection);
                if (moduleOptions.forceCreateCollections) {
                    modelPromises.push(modelCreated.createCollection());
                }
            });
            if (modelPromises.length > 0) {
                yield Promise.all(modelPromises);
            }
            connMap.set(tenantId, connection);
            return connection;
        });
    }
    static createBaseConnection(uri, baseUri, moduleOptions, baseConnMap, connMap, isReconnection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isReconnection) {
                const oldConnection = baseConnMap.get(baseUri);
                if (oldConnection) {
                    try {
                        yield oldConnection.close();
                    }
                    catch (error) {
                    }
                }
                this.clearTenantConnectionsForCluster(connMap, baseUri);
                this.connectionsWithHandlers.delete(baseUri);
            }
            const connectionOptions = Object.assign({ useNewUrlParser: true, useUnifiedTopology: true }, moduleOptions.options());
            const baseConnectionUri = this.buildBaseConnectionUri(uri, baseUri);
            const baseConnection = (0, mongoose_1.createConnection)(baseConnectionUri, connectionOptions);
            baseConnMap.set(baseUri, baseConnection);
            if (!this.connectionsWithHandlers.has(baseUri)) {
                this.setupConnectionHandlers(baseConnection, baseUri, connMap, baseConnMap);
                this.connectionsWithHandlers.add(baseUri);
            }
            yield new Promise((resolve, reject) => {
                if (baseConnection.readyState === 1) {
                    resolve();
                }
                else {
                    baseConnection.once('open', () => resolve());
                    baseConnection.once('error', reject);
                }
            });
            return baseConnection;
        });
    }
    static setupConnectionHandlers(connection, baseUri, connMap, baseConnMap) {
        connection.on('disconnected', () => {
            try {
                console.warn(`[TenancyModule] Base connection disconnected for cluster: ${baseUri}`);
                this.clearTenantConnectionsForCluster(connMap, baseUri);
                this.connectionsWithHandlers.delete(baseUri);
            }
            catch (error) {
                console.error(`[TenancyModule] Error handling disconnection for cluster: ${baseUri}`, error);
            }
        });
        connection.on('reconnected', () => {
            console.log(`[TenancyModule] Base connection reconnected for cluster: ${baseUri}`);
        });
        connection.on('error', (error) => {
            console.error(`[TenancyModule] Base connection error for cluster: ${baseUri}`, error.message);
        });
        connection.on('close', () => {
            try {
                console.warn(`[TenancyModule] Base connection closed for cluster: ${baseUri}`);
                baseConnMap.delete(baseUri);
                this.connectionsWithHandlers.delete(baseUri);
            }
            catch (error) {
                console.error(`[TenancyModule] Error handling close for cluster: ${baseUri}`, error);
            }
        });
    }
    static clearTenantConnectionsForCluster(connMap, baseUri) {
        try {
            const baseHostMatch = baseUri.match(/:\/\/([^@]*@)?([^/]+)/);
            const baseHost = baseHostMatch ? baseHostMatch[2] : null;
            const keysToDelete = [];
            connMap.forEach((connection, tenantId) => {
                try {
                    const connHost = connection.host;
                    if ((baseHost && connHost && connHost === baseHost) ||
                        (connHost && baseUri.includes(connHost))) {
                        keysToDelete.push(tenantId);
                    }
                }
                catch (error) {
                    console.warn(`[TenancyModule] Could not check connection host for tenant: ${tenantId}`);
                }
            });
            keysToDelete.forEach((key) => connMap.delete(key));
            if (keysToDelete.length > 0) {
                console.log(`[TenancyModule] Cleared ${keysToDelete.length} tenant connection(s) for cluster`);
            }
        }
        catch (error) {
            console.error(`[TenancyModule] Error clearing tenant connections for cluster: ${baseUri}`, error);
        }
    }
    static createBaseConnectionMapProvider() {
        return {
            provide: tenancy_constants_1.BASE_CONNECTION_MAP,
            useFactory: () => {
                const map = new Map();
                TenancyCoreModule_1.baseConnectionMapInstance = map;
                return map;
            },
        };
    }
    static createConnectionMapProvider() {
        return {
            provide: tenancy_constants_1.CONNECTION_MAP,
            useFactory: () => new Map(),
        };
    }
    static createModelDefinitionMapProvider() {
        return {
            provide: tenancy_constants_1.MODEL_DEFINITION_MAP,
            useFactory: () => new Map(),
        };
    }
    static createTenantConnectionProvider() {
        return {
            provide: tenancy_constants_1.TENANT_CONNECTION,
            scope: common_1.Scope.REQUEST,
            useFactory: (tenantId, moduleOptions, baseConnMap, connMap, modelDefMap) => __awaiter(this, void 0, void 0, function* () {
                return yield this.getConnection(tenantId, moduleOptions, baseConnMap, connMap, modelDefMap);
            }),
            inject: [
                tenancy_constants_1.TENANT_CONTEXT,
                tenancy_constants_1.TENANT_MODULE_OPTIONS,
                tenancy_constants_1.BASE_CONNECTION_MAP,
                tenancy_constants_1.CONNECTION_MAP,
                tenancy_constants_1.MODEL_DEFINITION_MAP,
            ],
        };
    }
    static createTenantContextProvider() {
        return {
            provide: tenancy_constants_1.TENANT_CONTEXT,
            scope: common_1.Scope.REQUEST,
            useFactory: (req, moduleOptions, adapterHost) => this.getTenant(req, moduleOptions, adapterHost),
            inject: [core_1.REQUEST, tenancy_constants_1.TENANT_MODULE_OPTIONS, tenancy_constants_1.DEFAULT_HTTP_ADAPTER_HOST],
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        const useClass = options.useClass;
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: tenancy_constants_1.TENANT_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        const inject = [
            (options.useClass || options.useExisting),
        ];
        return {
            provide: tenancy_constants_1.TENANT_MODULE_OPTIONS,
            useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return yield optionsFactory.createTenancyOptions(); }),
            inject,
        };
    }
    static createHttpAdapterProvider() {
        return {
            provide: tenancy_constants_1.DEFAULT_HTTP_ADAPTER_HOST,
            useFactory: (adapterHost) => adapterHost,
            inject: [core_1.HttpAdapterHost],
        };
    }
    static buildBaseConnectionUri(fullUri, baseUri) {
        try {
            const queryMatch = fullUri.match(/\?(.+)$/);
            const queryParams = queryMatch ? `?${queryMatch[1]}` : '';
            const hasAuthSource = queryParams.includes('authSource=');
            if (hasAuthSource) {
                return `${baseUri}${queryParams}`;
            }
            const hasAuth = fullUri.match(/:\/\/([^@]+)@/);
            if (hasAuth) {
                return `${baseUri}/admin${queryParams}`;
            }
            return `${baseUri}${queryParams}`;
        }
        catch (error) {
            return baseUri;
        }
    }
    static extractBaseUri(uri) {
        try {
            const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        catch (error) {
        }
        return uri;
    }
    static extractDatabaseName(uri, tenantId) {
        try {
            const match = uri.match(/\/([^/?]+)(\?|$)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        catch (error) {
        }
        return tenantId;
    }
    static isEmpty(obj) {
        return !obj || !Object.keys(obj).some((x) => obj[x] !== void 0);
    }
    static adapterIsFastify(adapterHost) {
        return adapterHost.httpAdapter.getType() === 'fastify';
    }
    static getSubdomainsForFastify(req) {
        var _a;
        let host = ((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.host) || '';
        host = host.split(':')[0];
        host = host.trim();
        return host.split('.').reverse();
    }
};
TenancyCoreModule.pendingConnections = new Map();
TenancyCoreModule.pendingTenantConnections = new Map();
TenancyCoreModule.connectionsWithHandlers = new Set();
TenancyCoreModule.baseConnectionMapInstance = null;
TenancyCoreModule = TenancyCoreModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], TenancyCoreModule);
exports.TenancyCoreModule = TenancyCoreModule;
