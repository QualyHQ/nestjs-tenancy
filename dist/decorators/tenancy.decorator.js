"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectTenancyConnection = exports.InjectTenancyModel = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../utils");
const InjectTenancyModel = (model) => (0, common_1.Inject)((0, utils_1.getTenantModelToken)(model));
exports.InjectTenancyModel = InjectTenancyModel;
const InjectTenancyConnection = (name) => (0, common_1.Inject)((0, utils_1.getTenantConnectionToken)(name));
exports.InjectTenancyConnection = InjectTenancyConnection;
