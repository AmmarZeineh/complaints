import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  check() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      port: process.env.PORT || '3000',
      pid: process.pid,
      uptime: process.uptime(),
    };
  }
}
