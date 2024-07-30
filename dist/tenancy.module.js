"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TenancyModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenancyModule = void 0;
const common_1 = require("@nestjs/common");
const tenancy_core_module_1 = require("./tenancy-core.module");
const tenancy_feature_module_1 = require("./tenancy-feature.module");
let TenancyModule = TenancyModule_1 = class TenancyModule {
    static forRoot(options) {
        return {
            module: TenancyModule_1,
            imports: [tenancy_core_module_1.TenancyCoreModule.register(options)],
        };
    }
    static forRootAsync(options) {
        return {
            module: TenancyModule_1,
            imports: [tenancy_core_module_1.TenancyCoreModule.registerAsync(options)],
        };
    }
    static forFeature(models) {
        return {
            module: TenancyModule_1,
            imports: [tenancy_feature_module_1.TenancyFeatureModule.register(models)],
        };
    }
};
TenancyModule = TenancyModule_1 = __decorate([
    (0, common_1.Module)({})
], TenancyModule);
exports.TenancyModule = TenancyModule;
