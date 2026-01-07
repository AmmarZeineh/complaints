import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const start = Date.now();

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.originalUrl;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(
          `${method} ${url} executed in ${duration}ms`,
        );
      }),
    );
  }
}
