import { DynamicModule } from '@nestjs/common';
import { ModelDefinition, TenancyModuleAsyncOptions, TenancyModuleOptions } from './interfaces';
export declare class TenancyModule {
    static forRoot(options: TenancyModuleOptions): DynamicModule;
    static forRootAsync(options: TenancyModuleAsyncOptions): DynamicModule;
    static forFeature(models: ModelDefinition[]): DynamicModule;
}
