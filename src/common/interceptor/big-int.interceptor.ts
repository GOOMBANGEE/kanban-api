import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return null;
        }

        return JSON.parse(
          JSON.stringify(data, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value,
          ),
        );
      }),
    );
  }
}
