import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { BadRequestResponseBody, PostgresErrorCode } from 'src/utils/enums';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let body: any;

    const e = exception as any;
    const isServeStaticException = e.code === 'ENOENT';
    if (isServeStaticException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();

      if (exception instanceof BadRequestException) body = { ...e.response };
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;

      if (e.code == PostgresErrorCode.FK_VIOLATION) {
        body = BadRequestResponseBody.FK_VIOLATION(e.detail, e.table);
      } else if (e?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
        body = BadRequestResponseBody.UNIQUE_VIOLATION('already exists');
      }
    } else if (
      exception instanceof PayloadTooLargeException ||
      (exception as any).type == 'entity.too.large'
    ) {
      status = HttpStatus.PAYLOAD_TOO_LARGE;
    } else {
      console.error(exception);
      this.logger.error({
        exception,
        request: {
          method: request.method,
          path: request.url,
          body: request.body,
          query: request.query,
          headers: request.headers,
        },
      });
    }

    body = {
      ...(body ?? (exception as any)),
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }
}
