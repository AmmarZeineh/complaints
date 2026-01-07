import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Request');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user?.id ?? 'Guest';
    const method = request.method;
    const url = request.originalUrl;

    this.logger.log(
      `User ${userId} -> ${method} ${url}`,
    );

    return next.handle();
  }
}
