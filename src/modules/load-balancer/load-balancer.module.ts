import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoadBalancerService } from './load-balancer.service';
import { LoadBalancerInterceptor } from './load-balancer.interceptor';
import { LoadBalancerController } from './load-balancer.controller';

@Global()
@Module({
  controllers: [LoadBalancerController],
  providers: [
    LoadBalancerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoadBalancerInterceptor,
    },
  ],
  exports: [LoadBalancerService],
})
export class LoadBalancerModule {}
