import { assert, assertStrictEquals } from "jsr:@std/assert";
import { TextLineStream } from "jsr:@std/streams";
import { JsonParseStream } from "jsr:@std/json";
import { type Log, LOG_LEVELS } from "../mod.ts";

// deno-lint-ignore no-explicit-any
export function assertIsLog(log: any): asserts log is Log {
  assertStrictEquals(typeof log, "object");
  assertStrictEquals(typeof log.timestamp, "number");
  assertStrictEquals(typeof log.level, "string");
  assert(Object.keys(LOG_LEVELS).includes(log.level));
  assert(Array.isArray(log.groups));
  assert(Array.isArray(log.data));
}

export function createJSONLineStream(...buffers: Uint8Array[]) {
  return ReadableStream.from(buffers)
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeThrough(new JsonParseStream());
}

export async function assertCollectLogLines(
  buffer: Uint8Array,
): Promise<Log[]> {
  const lines = [];
  for await (const line of createJSONLineStream(buffer)) {
    assertIsLog(line);
    lines.push(line);
  }
  return lines;
}
