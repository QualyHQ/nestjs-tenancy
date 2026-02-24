"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantModelToken = getTenantModelToken;
exports.getTenantModelDefinitionToken = getTenantModelDefinitionToken;
exports.getTenantConnectionToken = getTenantConnectionToken;
const tenancy_constants_1 = require("../tenancy.constants");
function getTenantModelToken(model) {
    return `${model}Model`;
}
function getTenantModelDefinitionToken(model) {
    return `${model}Definition`;
}
function getTenantConnectionToken(name) {
    return name && name !== tenancy_constants_1.DEFAULT_TENANT_DB_CONNECTION
        ? `${name}TenantConnection`
        : tenancy_constants_1.DEFAULT_TENANT_DB_CONNECTION;
}
