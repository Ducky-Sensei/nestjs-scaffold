import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import {
    BatchSpanProcessor,
    ConsoleSpanExporter,
    SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

console.log('[OpenTelemetry] Initializing instrumentation...');
console.log('[OpenTelemetry] Service name:', process.env.OTEL_SERVICE_NAME || 'scaffold-service');
console.log('[OpenTelemetry] Exporter type:', process.env.OTEL_EXPORTER_TYPE || 'otlp');

const resource = defaultResource().merge(
    resourceFromAttributes({
        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'scaffold-service',
        [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.0.1',
    }),
);

const useConsoleExporter = process.env.OTEL_EXPORTER_TYPE === 'console';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

class DebugConsoleExporter extends ConsoleSpanExporter {
    export(spans, resultCallback) {
        console.log(
            '[OpenTelemetry] DebugConsoleExporter.export() called with',
            spans.length,
            'span(s)',
        );
        return super.export(spans, resultCallback);
    }
}

const spanProcessor = useConsoleExporter
    ? new SimpleSpanProcessor(new DebugConsoleExporter())
    : new BatchSpanProcessor(
          new OTLPTraceExporter({
              url: otlpEndpoint,
          }),
      );

console.log(
    '[OpenTelemetry] Using span processor:',
    useConsoleExporter ? 'SimpleSpanProcessor (Console)' : 'BatchSpanProcessor (OTLP)',
);

const provider = new NodeTracerProvider({
    resource,
    spanProcessors: [spanProcessor],
});

provider.register();

console.log('[OpenTelemetry] Tracer provider registered');

registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation({
            // Ignore Docker API calls and other localhost infrastructure calls
            ignoreOutgoingRequestHook: (request) => {
                const url = request.path || '';
                const host = request.host || '';

                // Ignore Docker API calls (testcontainers)
                if (
                    url.includes('/containers/') ||
                    url.includes('/exec/') ||
                    url.includes('/images/')
                ) {
                    return true;
                }

                // Ignore localhost:80 (Docker socket)
                if (host === 'localhost:80' || host === 'localhost') {
                    return true;
                }

                return false;
            },
            // Optionally ignore incoming requests if needed
            ignoreIncomingRequestHook: (request) => {
                return request.url === '/health';
            },
        }),
        new ExpressInstrumentation(),
        new NestInstrumentation(),
    ],
});

console.log('[OpenTelemetry] Instrumentations registered successfully');
