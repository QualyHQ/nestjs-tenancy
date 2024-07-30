import { DynamicModule, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TenancyModuleAsyncOptions, TenancyModuleOptions } from './interfaces';
export declare class TenancyCoreModule implements OnApplicationShutdown {
    private readonly moduleRef;
    constructor(moduleRef: ModuleRef);
    static register(options: TenancyModuleOptions): DynamicModule;
    static registerAsync(options: TenancyModuleAsyncOptions): DynamicModule;
    onApplicationShutdown(): Promise<void>;
    private static getTenant;
    private static getTenantFromRequest;
    private static getTenantFromSubdomain;
    private static getConnection;
    private static createConnectionMapProvider;
    private static createModelDefinitionMapProvider;
    private static createTenantContextProvider;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
    private static createHttpAdapterProvider;
    private static isEmpty;
    private static adapterIsFastify;
    private static getSubdomainsForFastify;
}
