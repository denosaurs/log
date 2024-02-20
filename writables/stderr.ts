import { getStdWritableStream } from "../utils/std.ts";

/**
 * Get a runtime agnostic writable stream for stderr.
 */
export function getStderrWritableStream(): WritableStream<Uint8Array> {
  return getStdWritableStream("stderr");
}
