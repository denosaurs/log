// Ensure Bun compatibility. [It currently lacks support for TextEncoderStream](https://github.com/oven-sh/bun/issues/5648)
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";

import { StdoutWritableStream } from "@denosaurs/log/writables/stdout";

import { JsonStringifyStream } from "@std/json";

// Capture logs from the console
const stream = new ConsoleReadableStream();
stream
  // Stringify the logs JSON
  .pipeThrough(new JsonStringifyStream())
  // Encode the output to an UTF-8 byte stream
  .pipeThrough(new TextEncoderStream())
  // Pipe the output to stdout
  .pipeTo(new StdoutWritableStream());

// Log some messages
console.log("Hello, world!");
console.group("Group 1");
console.debug("Debug message");
console.groupEnd();
console.info("Info message");
