import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, from, EMPTY } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
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

    if (request.headers['x-forwarded-from']) {
      this.logger.debug('Working on worker port');
      return next.handle();
    }

    return from(this.forwardToWorker(request, response)).pipe(
      mergeMap((forwarded) => {
        if (forwarded) {
          // إذا تم الرد من الـ worker، لا نستدعي next.handle() مطلقًا
          return EMPTY;
        }
        return next.handle();
      }),
      catchError((error) => {
        this.logger.error(`❌ Load balancer error: ${error.message}`);
        this.logger.warn('⚠️ Falling back to main server handler');

        // fallback فقط إذا لم يتم إرسال response
        if (!response.headersSent) {
          return next.handle();
        }
        return EMPTY;
      }),
    );
  }

  private async forwardToWorker(
    request: Request,
    response: Response,
  ): Promise<boolean> {
    try {
      this.logger.log(`🔄 Load balancing: ${request.method} ${request.url}`);

      const result = await this.lbService.forwardRequest(
        request.method,
        request.url,
        request.body,
        request.headers,
      );

      if (!response.headersSent) {
        response.setHeader('X-Served-By', result.serverName);
        response.setHeader('X-Server-Port', result.serverPort.toString());
        response.setHeader('X-Load-Balanced', 'true');

        this.logger.log(
          `✅ ${request.method} ${request.url} -> ${result.serverName}:${result.serverPort} [${result.status}]`,
        );

        response.status(result.status).json(result.data);
      }

      return true;
    } catch (error) {
      this.logger.error(`❌ Error in forwardToWorker: ${error.message}`);
      return false;
    }
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
//       //this.logger.debug(`⏭️ Bypassing LB for: ${request.url}`);
//       return next.handle();
//     }
//     if (request.headers['x-forwarded-from']) {
//       this.logger.debug('working on this port');
//       return next.handle();
//     }

//     return from(this.handleRequest(request, response, next));
//   }

//   private async handleRequest(
//     request: Request,
//     response: Response,
//     next: CallHandler,
//   ): Promise<any> {
//     try {
//       this.logger.log(`🔄 Load balancing: ${request.method} ${request.url}`);

//       const result = await this.lbService.forwardRequest(
//         request.method,
//         request.url,
//         request.body,
//         request.headers,
//       );

//       response.setHeader('X-Served-By', result.serverName);
//       response.setHeader('X-Server-Port', result.serverPort.toString());
//       response.setHeader('X-Load-Balanced', 'true');
//       this.logger.log(`Working on ${result.serverName}`);

//       this.logger.log(
//         `✅ ${request.method} ${request.url} -> ${result.serverName}:${result.serverPort} [${result.status}]`,
//       );

//       response.status(result.status).json(result.data);

//       return null;
//     } catch (error) {
//       this.logger.error(`❌ Load balancer error: ${error.message}`);
//       this.logger.warn('⚠️ Falling back to main server handler');

//       return next.handle().toPromise();
//     }
//   }
// }
