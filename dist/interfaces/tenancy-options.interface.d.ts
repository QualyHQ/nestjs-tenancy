import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
export interface TenancyModuleOptions extends Record<string, any> {
    isTenantFromSubdomain?: boolean;
    tenantIdentifier?: string;
    uri: (uri: string) => Promise<string> | string;
    validator?: (tenantId: string) => TenancyValidator;
    options?: any;
    whitelist?: any;
    forceCreateCollections?: boolean;
}
export interface TenancyOptionsFactory {
    createTenancyOptions(): Promise<TenancyModuleOptions> | TenancyModuleOptions;
}
export interface TenancyModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<TenancyOptionsFactory>;
    useClass?: Type<TenancyOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<TenancyModuleOptions> | TenancyModuleOptions;
    inject?: any[];
}
export interface TenancyValidator {
    setTenantId(tenantId: string): TenancyValidator;
    validate(): Promise<void>;
}
