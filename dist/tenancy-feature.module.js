"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TenancyFeatureModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenancyFeatureModule = void 0;
const common_1 = require("@nestjs/common");
const factories_1 = require("./factories");
let TenancyFeatureModule = TenancyFeatureModule_1 = class TenancyFeatureModule {
    static register(models) {
        const providers = (0, factories_1.createTenancyProviders)(models);
        return {
            module: TenancyFeatureModule_1,
            providers,
            exports: providers,
        };
    }
};
TenancyFeatureModule = TenancyFeatureModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], TenancyFeatureModule);
exports.TenancyFeatureModule = TenancyFeatureModule;
