import { SpanStatusCode, trace, type Attributes } from "@opentelemetry/api"

const tracer = trace.getTracer("twt")

/**
 * Runs `fn` inside a named span. Errors are recorded on the span (status +
 * exception event) and re-thrown, so failures show up in traces instead of
 * only in stdout. When no OpenTelemetry SDK is registered (tests, local dev
 * without the runtime image) this is a no-op passthrough.
 */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: () => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      return await fn()
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)))
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : undefined,
      })
      throw error
    } finally {
      span.end()
    }
  })
}

/** Records an error on the currently active span, if any. */
export function recordSpanError(error: unknown): void {
  const span = trace.getActiveSpan()
  if (!span) return

  span.recordException(error instanceof Error ? error : new Error(String(error)))
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error instanceof Error ? error.message : undefined,
  })
}

/** Adds attributes to the currently active span, if any. */
export function setSpanAttributes(attributes: Attributes): void {
  trace.getActiveSpan()?.setAttributes(attributes)
}
