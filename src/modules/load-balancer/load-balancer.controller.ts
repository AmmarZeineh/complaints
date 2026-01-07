import { Controller, Get } from '@nestjs/common';
import { LoadBalancerService } from './load-balancer.service';

@Controller('lb')
export class LoadBalancerController {
  constructor(private readonly lbService: LoadBalancerService) {}

  @Get('status')
  getStatus() {
    return {
      timestamp: new Date().toISOString(),
      ...this.lbService.getStatus(),
    };
  }
}
