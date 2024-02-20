import { getStdWritableStream } from "../utils/std.ts";

/**
 * Get a runtime agnostic writable stream for stdout.
 */
export function getStdoutWritableStream() {
  return getStdWritableStream("stdout");
}
