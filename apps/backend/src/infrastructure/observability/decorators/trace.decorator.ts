import { SpanStatusCode, trace } from '@opentelemetry/api';

export function Trace(name?: string): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const spanName =
      name ?? `${target.constructor.name}.${String(propertyKey)}`;

    descriptor.value = function (...args: unknown[]) {
      const tracer = trace.getTracer('crossroad');

      return tracer.startActiveSpan(spanName, (span) => {
        try {
          const result = originalMethod.apply(this, args);

          if (result instanceof Promise) {
            return result
              .catch((error) => {
                span.recordException(error);
                span.setStatus({ code: SpanStatusCode.ERROR });
                throw error;
              })
              .finally(() => span.end());
          }

          span.end();
          return result;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR });
          span.end();
          throw error;
        }
      });
    };

    return descriptor;
  };
}
