import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponseBody {
  message?: string | string[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    let message = exception.message;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseBody = exceptionResponse as ErrorResponseBody;

      if (Array.isArray(responseBody.message)) {
        message = responseBody.message.join(', ');
      } else if (responseBody.message) {
        message = responseBody.message;
      }
    }

    response.status(status).json({
      success: false,
      error: {
        message,
        statusCode: status,
      },
    });
  }
}
