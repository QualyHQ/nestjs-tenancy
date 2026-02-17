import { Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TenancyModuleOptions } from './interfaces';
export declare class TenancyService {
    private moduleRef;
    private options;
    constructor(moduleRef: ModuleRef, options: TenancyModuleOptions);
    run<T, R = void>(tenantId: string, serviceType: Type<T>, fn: (service: T) => Promise<R>): Promise<R>;
    run<R = void>(tenantId: string, fn: (resolve: <S>(type: Type<S>) => Promise<S>) => Promise<R>): Promise<R>;
    private buildRequest;
}
