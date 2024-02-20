import { getStdWritableStream } from "../utils/std.ts";

/**
 * Get a runtime agnostic writable stream for stderr.
 */
export function getStderrWritableStream() {
  return getStdWritableStream("stderr");
}
