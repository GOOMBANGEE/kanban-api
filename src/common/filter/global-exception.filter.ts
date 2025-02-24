import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Logger } from 'winston';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject('winston') private readonly logger: Logger) {}
  @SentryExceptionCaptured()
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statusCode = getStatusCode(exception);
    const message = getErrorMessage(exception);
    this.logger.debug(exception);

    // Sentry에 예외 전송
    Sentry.captureException(exception);

    // 응답 반환
    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

export const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = <T>(exception: T): string => {
  return exception instanceof HttpException
    ? exception.message
    : String(exception);
};
