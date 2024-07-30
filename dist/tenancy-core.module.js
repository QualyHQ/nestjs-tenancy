"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    static register(options) {
        const tenancyModuleOptionsProvider = {
            provide: tenancy_constants_1.TENANT_MODULE_OPTIONS,
            useValue: Object.assign({}, options),
        };
        const connectionMapProvider = this.createConnectionMapProvider();
        const modelDefinitionMapProvider = this.createModelDefinitionMapProvider();
        const tenantContextProvider = this.createTenantContextProvider();
        const httpAdapterHost = this.createHttpAdapterProvider();
        const tenantConnectionProvider = {
            provide: tenancy_constants_1.TENANT_CONNECTION,
            useFactory: (tenantId, moduleOptions, connMap, modelDefMap) => __awaiter(this, void 0, void 0, function* () {
                return yield this.getConnection(tenantId, moduleOptions, connMap, modelDefMap);
            }),
            inject: [
                tenancy_constants_1.TENANT_CONTEXT,
                tenancy_constants_1.TENANT_MODULE_OPTIONS,
                tenancy_constants_1.CONNECTION_MAP,
                tenancy_constants_1.MODEL_DEFINITION_MAP,
            ],
        };
        const providers = [
            tenancyModuleOptionsProvider,
            tenantContextProvider,
            connectionMapProvider,
            modelDefinitionMapProvider,
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
        const tenantConnectionProvider = {
            provide: tenancy_constants_1.TENANT_CONNECTION,
            useFactory: (tenantId, moduleOptions, connMap, modelDefMap) => __awaiter(this, void 0, void 0, function* () {
                return yield this.getConnection(tenantId, moduleOptions, connMap, modelDefMap);
            }),
            inject: [
                tenancy_constants_1.TENANT_CONTEXT,
                tenancy_constants_1.TENANT_MODULE_OPTIONS,
                tenancy_constants_1.CONNECTION_MAP,
                tenancy_constants_1.MODEL_DEFINITION_MAP,
            ],
        };
        const asyncProviders = this.createAsyncProviders(options);
        const providers = [
            ...asyncProviders,
            tenantContextProvider,
            connectionMapProvider,
            modelDefinitionMapProvider,
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
            const connectionMap = this.moduleRef.get(tenancy_constants_1.CONNECTION_MAP);
            yield Promise.all([...connectionMap.values()].map((connection) => connection.close()));
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
    static getConnection(tenantId, moduleOptions, connMap, modelDefMap) {
        return __awaiter(this, void 0, void 0, function* () {
            if (moduleOptions.validator) {
                yield moduleOptions.validator(tenantId).validate();
            }
            const exists = connMap.has(tenantId);
            if (exists) {
                const connection = connMap.get(tenantId);
                if (moduleOptions.forceCreateCollections) {
                    yield Promise.all(Object.entries(connection.models).map(([k, m]) => m.createCollection()));
                }
                return connection;
            }
            const uri = yield Promise.resolve(moduleOptions.uri(tenantId));
            const connectionOptions = Object.assign({ useNewUrlParser: true, useUnifiedTopology: true }, moduleOptions.options());
            const connection = (0, mongoose_1.createConnection)(uri, connectionOptions);
            modelDefMap.forEach((definition) => __awaiter(this, void 0, void 0, function* () {
                const { name, schema, collection } = definition;
                const modelCreated = connection.model(name, schema, collection);
                if (moduleOptions.forceCreateCollections) {
                    yield modelCreated.createCollection();
                }
            }));
            connMap.set(tenantId, connection);
            return connection;
        });
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
TenancyCoreModule = TenancyCoreModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({}),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], TenancyCoreModule);
exports.TenancyCoreModule = TenancyCoreModule;
