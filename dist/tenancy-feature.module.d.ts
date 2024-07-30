import { DynamicModule } from '@nestjs/common';
import { ModelDefinition } from './interfaces';
export declare class TenancyFeatureModule {
    static register(models: ModelDefinition[]): DynamicModule;
}
