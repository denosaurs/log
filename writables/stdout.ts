import { getWriteableStdStream } from "../utils/std.ts";

/**
 * A runtime agnostic writable stream for stderr.
 */
export class StdoutWritableStream extends WritableStream<Uint8Array> {
  constructor() {
    super(getWriteableStdStream("stdout"));
  }
}
