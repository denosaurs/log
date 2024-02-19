import { environment, isNode } from "../utils/runtime.ts";

let nodeWritableToWeb: (
  stream: unknown,
) => WritableStream<Uint8Array> | undefined;
if (isNode) {
  nodeWritableToWeb = (await import("node:stream")).Writable.toWeb as (
    stream: unknown,
  ) => WritableStream<Uint8Array>;
}

export function getWriteableStdStream(
  stream: "stdout" | "stderr",
): WritableStream<Uint8Array> {
  switch (environment) {
    case "deno":
      return globalThis.Deno[stream].writable;
    case "bun": {
      // Once https://github.com/oven-sh/bun/issues/3927 is completed we can use the node code for bun.
      return new WritableStream({
        write: async (chunk) => {
          // @ts-expect-error: The type checking environment is deno, the bun types are not available
          await globalThis.Bun.write(globalThis.Bun[stream], chunk);
        },
      });
    }
    case "node": {
      // @ts-expect-error: The type checking environment is deno, the node types are not available
      return nodeWritableToWeb!(globalThis.process[stream]);
    }
    case "browser":
    case "unknown": {
      const decoder = new TextDecoder();
      let buffer = "";
      const write = stream === "stdout" ? console.log : console.error;
      return new WritableStream({
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
      });
    }
    default:
      throw new Error("Unsupported environment");
  }
}
