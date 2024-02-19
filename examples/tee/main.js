// Ensure Bun compatibility
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";
import { stderr } from "@denosaurs/log/writables/stderr";
import { stdout } from "@denosaurs/log/writables/stdout";

import { JsonStringifyStream } from "@std/json";

const stream = new ConsoleReadableStream();
const [a, b] = stream
  .pipeThrough(new JsonStringifyStream())
  .pipeThrough(new TextEncoderStream())
  .tee();

a.pipeTo(stderr);
b.pipeTo(stdout);

console.log("Hello, world!");
console.group("Group 1");
console.debug("Debug message");
console.groupEnd();
console.info("Info message");
