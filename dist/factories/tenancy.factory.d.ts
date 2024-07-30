import { Provider } from '@nestjs/common';
import { ModelDefinition } from '../interfaces';
export declare const createTenancyProviders: (definitions: ModelDefinition[]) => Provider[];
