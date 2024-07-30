"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantConnectionToken = exports.getTenantModelDefinitionToken = exports.getTenantModelToken = void 0;
const tenancy_constants_1 = require("../tenancy.constants");
function getTenantModelToken(model) {
    return `${model}Model`;
}
exports.getTenantModelToken = getTenantModelToken;
function getTenantModelDefinitionToken(model) {
    return `${model}Definition`;
}
exports.getTenantModelDefinitionToken = getTenantModelDefinitionToken;
function getTenantConnectionToken(name) {
    return name && name !== tenancy_constants_1.DEFAULT_TENANT_DB_CONNECTION
        ? `${name}TenantConnection`
        : tenancy_constants_1.DEFAULT_TENANT_DB_CONNECTION;
}
exports.getTenantConnectionToken = getTenantConnectionToken;
