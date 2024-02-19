// Ensure Bun compatibility
import "@denosaurs/log/transforms/text_encoder_stream.ts";

import { ConsoleReadableStream } from "@denosaurs/log";
import { stdout } from "@denosaurs/log/writables/stdout";

import { JsonStringifyStream } from "@std/json";

const stream = new ConsoleReadableStream();
stream
  .pipeThrough(new JsonStringifyStream())
  .pipeThrough(new TextEncoderStream())
  .pipeTo(stdout);

console.log("Hello, world!");
console.group("Group 1");
console.debug("Debug message");
console.groupEnd();
console.info("Info message");
