import { environment } from "../utils/runtime.ts";

let writable: WritableStream<Uint8Array>;

switch (environment) {
  case "deno":
    writable = globalThis.Deno.stdout.writable;
    break;
  case "bun": {
    // Once https://github.com/oven-sh/bun/issues/3927 is completed we can use the node code for bun.
    writable = new WritableStream({
      write: async (chunk) => {
        // @ts-expect-error: The type checking environment is deno, the bun types are not available
        await globalThis.Bun.write(globalThis.Bun.stdout, chunk);
      },
    });
    break;
  }
  case "node": {
    const { Writable } = await import("node:stream");
    // @ts-expect-error: The type checking environment is deno, the node types are not available
    writable = Writable.toWeb(globalThis.process.stdout);
    break;
  }
  case "browser":
  case "unknown": {
    const decoder = new TextDecoder();
    let buffer = "";
    writable = new WritableStream({
      write: (chunk) => {
        buffer += decoder.decode(chunk);
        const lines = buffer.split("\n");
        if (lines.length > 1) {
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            console.log(line);
          }
        }
      },
      close: () => {
        if (buffer.length > 0) {
          const lines = buffer.split("\n");
          for (const line of lines) {
            console.log(line);
          }
        }
      },
    });
    break;
  }
  default:
    throw new Error("Unsupported environment");
}

/**
 * A runtime agnostic writable stream for stdout.
 */
export const stdout = writable;
