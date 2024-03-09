/**
 * # StdoutWritableStream and StderrWritableStream
 *
 * Cross-runtime writable streams for the standard output and standard error.
 *
 * @example
 * ```ts
 * import { ConsoleReadableStream } from "@denosaurs/log";
 * import { StdoutWritableStream } from "@denosaurs/log/writables/std";
 * import { JsonStringifyStream } from "@std/json";
 *
 * // Capture logs from the console
 * const stream = new ConsoleReadableStream();
 * stream
 *   // Stringify the logs to JSON
 *   .pipeThrough(new JsonStringifyStream())
 *   // Encode the output to an UTF-8 byte stream
 *   .pipeThrough(new TextEncoderStream())
 *   // Pipe the output to stdout
 *   .pipeTo(new StdoutWritableStream());
 * ```
 *
 * @module
 */

import { originalConsole } from "../utils/original_console.ts";
import { environment, isNode } from "../utils/runtime.ts";

let nodeWritableToWeb: (
  stream: unknown,
) => WritableStream<Uint8Array> | undefined;
if (isNode) {
  nodeWritableToWeb = (await import("node:stream")).Writable.toWeb as (
    stream: unknown,
  ) => WritableStream<Uint8Array>;
}

/**
 * A writable stream for standard output or error.
 */
export class StdWritableStream extends WritableStream<Uint8Array> {
  constructor(stream: "stdout" | "stderr") {
    let sink: UnderlyingSink<Uint8Array>;
    switch (environment) {
      case "deno":
        sink = {
          write: async (chunk) => {
            await globalThis.Deno[stream].write(chunk);
          },
        };
        break;
      case "bun":
        // Once https://github.com/oven-sh/bun/issues/3927 is completed we can use the node code for bun.
        sink = {
          write: async (chunk) => {
            // @ts-expect-error: The type checking environment is deno, the bun types are not available
            await globalThis.Bun.write(globalThis.Bun[stream], chunk);
          },
        };
        break;
      case "node":
        // @ts-expect-error: The type checking environment is deno, the node types are not available
        sink = nodeWritableToWeb!(globalThis.process[stream]);
        break;
      case "browser":
      case "unknown": {
        const decoder = new TextDecoder();
        let buffer = "";
        const write = stream === "stdout"
          ? originalConsole.log
          : originalConsole.error;

        sink = {
          write: (chunk) => {
            buffer += decoder.decode(chunk);
            const lines = buffer.split("\n");
            if (lines.length > 1) {
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                write(line);
              }
            }
          },
          close: () => {
            if (buffer.length > 0) {
              const lines = buffer.split("\n");
              for (const line of lines) {
                write(line);
              }
            }
          },
        };
        break;
      }
    }

    super(sink);
  }
}

/**
 * A writable stream for standard output.
 */
export class StdoutWritableStream extends StdWritableStream {
  constructor() {
    super("stdout");
  }
}

/**
 * A writable stream for standard error.
 */
export class StderrWritableStream extends StdWritableStream {
  constructor() {
    super("stderr");
  }
}
