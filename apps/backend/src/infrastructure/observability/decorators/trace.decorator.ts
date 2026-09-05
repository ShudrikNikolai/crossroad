import {
  trace,
  SpanStatusCode,
} from '@opentelemetry/api';

export function Trace(name?: string): MethodDecorator {
  return (
    target,
    propertyKey,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const tracer = trace.getTracer('crossroad');

      const spanName =
        name ??
        `${target.constructor.name}.${String(propertyKey)}`;

      return tracer.startActiveSpan(
        spanName,
        async (span) => {
          try {
            return await originalMethod.apply(this, args);
          } catch (error) {
            span.recordException(error as Error);

            span.setStatus({
              code: SpanStatusCode.ERROR,
            });

            throw error;
          } finally {
            span.end();
          }
        },
      );
    };

    return descriptor;
  };
}
