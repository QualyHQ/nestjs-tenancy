"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenancyProviders = void 0;
const tenancy_constants_1 = require("../tenancy.constants");
const utils_1 = require("../utils");
const createTenancyProviders = (definitions) => {
    const providers = [];
    for (const definition of definitions) {
        const { name, schema, collection } = definition;
        providers.push({
            provide: (0, utils_1.getTenantModelDefinitionToken)(name),
            useFactory: (modelDefinitionMap, connectionMap) => {
                const exists = modelDefinitionMap.has(name);
                if (!exists) {
                    modelDefinitionMap.set(name, Object.assign({}, definition));
                    connectionMap.forEach((connection) => {
                        connection.model(name, schema, collection);
                    });
                }
            },
            inject: [tenancy_constants_1.MODEL_DEFINITION_MAP, tenancy_constants_1.CONNECTION_MAP],
        });
        providers.push({
            provide: (0, utils_1.getTenantModelToken)(name),
            useFactory(tenantConnection) {
                return (tenantConnection.models[name] ||
                    tenantConnection.model(name, schema, collection));
            },
            inject: [tenancy_constants_1.TENANT_CONNECTION],
        });
    }
    return providers;
};
exports.createTenancyProviders = createTenancyProviders;
