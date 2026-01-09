import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoadBalancerService } from './load-balancer.service';
import { Request, Response } from 'express';

@Injectable()
export class LoadBalancerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoadBalancerInterceptor.name);

  constructor(private readonly lbService: LoadBalancerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const excludedPaths = ['/api/health', '/api/lb/status', '/api/lb'];
    const shouldExclude = excludedPaths.some((path) => {
      return (
        request.url === path ||
        request.url.startsWith(path + '/') ||
        request.url.startsWith(path + '?')
      );
    });

    if (!this.lbService.isLoadBalancerEnabled() || shouldExclude) {
      return next.handle();
    }

    // منع إعادة التوجيه اللانهائي
    if (request.headers['x-forwarded-from']) {
      this.logger.debug('Request already forwarded, handling locally');
      return next.handle();
    }

    return from(this.handleRequest(request, response)).pipe(
      catchError((error) => {
        this.logger.error(`❌ Load balancer error: ${error.message}`);
        this.logger.warn('⚠️ Falling back to main server handler');
        return next.handle();
        return next.handle();
      }),
    );
  }

  private async handleRequest(
  private async handleRequest(
    request: Request,
    response: Response,
  ): Promise<void> {
    this.logger.log(`🔄 Load balancing: ${request.method} ${request.url}`);

    // ⚠️ لاحظ: لا نعيد بيانات
    await this.lbService.forwardRequestStream(request, response);

    // لا ترجع أي شيء — الـ response أُرسل من السيرفر الآخر
    return;
  }
}

// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
//   Logger,
// } from '@nestjs/common';
// import { Observable, from, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { LoadBalancerService } from './load-balancer.service';
// import { Request, Response } from 'express';

// @Injectable()
// export class LoadBalancerInterceptor implements NestInterceptor {
//   private readonly logger = new Logger(LoadBalancerInterceptor.name);

//   constructor(private readonly lbService: LoadBalancerService) {}

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const request = context.switchToHttp().getRequest<Request>();
//     const response = context.switchToHttp().getResponse<Response>();

//     const excludedPaths = ['/api/health', '/api/lb/status', '/api/lb'];
//     const shouldExclude = excludedPaths.some((path) => {
//       return (
//         request.url === path ||
//         request.url.startsWith(path + '/') ||
//         request.url.startsWith(path + '?')
//       );
//     });

//     if (!this.lbService.isLoadBalancerEnabled() || shouldExclude) {
//       return next.handle();
//     }

//     if (request.headers['x-forwarded-from']) {
//       this.logger.debug('Working on this port');
//       return next.handle();
//     }

//     // استخدم from() لتحويل Promise إلى Observable
//     return from(this.handleRequest(request, response)).pipe(
//       catchError((error) => {
//         this.logger.error(`❌ Load balancer error: ${error.message}`);
//         this.logger.warn('⚠️ Falling back to main server handler');
//         return next.handle();
//       }),
//     );
//   }

//   private async handleRequest(
//     request: Request,
//     response: Response,
//   ): Promise<any> {
//     this.logger.log(`🔄 Load balancing: ${request.method} ${request.url}`);

//     const result = await this.lbService.forwardRequest(
//       request.method,
//       request.url,
//       request.body,
//       request.headers,
//     );

//     // أضف الـ headers
//     response.setHeader('X-Served-By', result.serverName);
//     response.setHeader('X-Server-Port', result.serverPort.toString());
//     response.setHeader('X-Load-Balanced', 'true');

//     // أضف status code
//     response.status(result.status);

//     this.logger.log(`Working on ${result.serverName}`);
//     this.logger.log(
//       `✅ ${request.method} ${request.url} -> ${result.serverName}:${result.serverPort} [${result.status}]`,
//     );

//     // ارجع البيانات فقط، NestJS سيتولى إرسالها
//     return result.data;
//   }
// }
