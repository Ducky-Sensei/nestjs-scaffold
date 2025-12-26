import { trace } from '@opentelemetry/api';
import type { NextFunction, Request, Response } from 'express';
import { v7 as uuidv7 } from 'uuid';

/**
 * RequestIdMiddleware adds a unique request ID to each request.
 *
 * Priority order:
 * 1. Client-provided X-Request-ID header (if present)
 * 2. OpenTelemetry trace ID (if OTel is active)
 * 3. UUID v7 (fallback)
 *
 * The request ID is:
 * - Attached to req.id for logging
 * - Returned in X-Request-ID response header
 * - Automatically included in Pino logs via customProps
 */
export function RequestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const span = trace.getActiveSpan();
    const traceId = span?.spanContext().traceId;

    if (req.headers['x-request-id']) {
        // Respect client-provided request ID
        (req as any).id = req.headers['x-request-id'];
    } else if (traceId) {
        // Use OpenTelemetry trace ID
        (req as any).id = traceId;
    } else {
        (req as any).id = uuidv7();
    }

    res.setHeader('X-Request-ID', (req as any).id);
    next();
}
