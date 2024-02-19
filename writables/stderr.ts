import { getWriteableStdStream } from "../utils/std.ts";

/**
 * A runtime agnostic writable stream for stderr.
 */
export class StderrWritableStream extends WritableStream<Uint8Array> {
  constructor() {
    super(getWriteableStdStream("stderr"));
  }
}
