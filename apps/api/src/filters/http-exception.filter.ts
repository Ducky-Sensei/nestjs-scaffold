import {
    type ArgumentsHost,
    Catch,
    type ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    message: string;
    error?: string;
    details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const errorResponse = this.buildErrorResponse(exception, request);

        // Log the error with appropriate level
        this.logError(exception, request, errorResponse);

        response.status(errorResponse.statusCode).json(errorResponse);
    }

    private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
        const timestamp = new Date().toISOString();
        const path = request.url;
        const method = request.method;

        // Handle HttpException (NestJS exceptions)
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            return {
                statusCode: status,
                timestamp,
                path,
                method,
                message:
                    typeof exceptionResponse === 'string'
                        ? exceptionResponse
                        : (exceptionResponse as { message?: string }).message ||
                          'An error occurred',
                error: exception.name,
                details:
                    process.env.NODE_ENV !== 'production' && typeof exceptionResponse === 'object'
                        ? exceptionResponse
                        : undefined,
            };
        }

        // Handle TypeORM database errors
        if (exception instanceof QueryFailedError) {
            return this.handleDatabaseError(exception, timestamp, path, method);
        }

        return this.handleUnknownError(exception, timestamp, path, method);
    }

    private handleDatabaseError(
        exception: QueryFailedError,
        timestamp: string,
        path: string,
        method: string,
    ): ErrorResponse {
        const driverError = exception.driverError as { code?: string; detail?: string };

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Database error occurred';

        switch (driverError?.code) {
            case '23505': // Unique violation
                statusCode = HttpStatus.CONFLICT;
                message = 'Resource already exists';
                break;
            case '23503': // Foreign key violation
                statusCode = HttpStatus.BAD_REQUEST;
                message = 'Referenced resource does not exist';
                break;
            case '23502': // Not null violation
                statusCode = HttpStatus.BAD_REQUEST;
                message = 'Required field is missing';
                break;
            case '22P02': // Invalid text representation
                statusCode = HttpStatus.BAD_REQUEST;
                message = 'Invalid data format';
                break;
            default:
                statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                message = 'Database operation failed';
        }

        return {
            statusCode,
            timestamp,
            path,
            method,
            message,
            error: 'DatabaseError',
            details:
                process.env.NODE_ENV !== 'production'
                    ? {
                          code: driverError?.code,
                          detail: driverError?.detail,
                      }
                    : undefined,
        };
    }

    private handleUnknownError(
        exception: unknown,
        timestamp: string,
        path: string,
        method: string,
    ): ErrorResponse {
        const message =
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : exception instanceof Error
                  ? exception.message
                  : 'Unknown error occurred';

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp,
            path,
            method,
            message,
            error: 'InternalServerError',
            details:
                process.env.NODE_ENV !== 'production' && exception instanceof Error
                    ? {
                          name: exception.name,
                          stack: exception.stack,
                      }
                    : undefined,
        };
    }

    private logError(exception: unknown, request: Request, errorResponse: ErrorResponse): void {
        const { statusCode, message } = errorResponse;
        const { method, url, body, query, params } = request;

        const context = {
            method,
            url,
            statusCode,
            message,
            body: Object.keys(body || {}).length > 0 ? body : undefined,
            query: Object.keys(query || {}).length > 0 ? query : undefined,
            params: Object.keys(params || {}).length > 0 ? params : undefined,
        };

        if (statusCode >= 500) {
            // Server errors - log as error with full details
            this.logger.error(
                {
                    ...context,
                    error: exception instanceof Error ? exception.message : String(exception),
                    stack: exception instanceof Error ? exception.stack : undefined,
                },
                exception instanceof Error ? exception.stack : undefined,
            );
        } else if (statusCode >= 400) {
            // Client errors - log as warning
            this.logger.warn(context);
        } else {
            this.logger.log(context);
        }
    }
}
