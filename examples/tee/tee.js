// Ensure Bun compatibility. [It currently lacks support for TextEncoderStream](https://github.com/oven-sh/bun/issues/5648)
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";

import { getStdoutWritableStream } from "@denosaurs/log/writables/stdout";
import { getStderrWritableStream } from "@denosaurs/log/writables/stderr";

import { OmitLogLevelStream } from "@denosaurs/log/transforms/omit";
import { PickLogLevelStream } from "@denosaurs/log/transforms/pick";

import { JsonStringifyStream } from "@std/json";

// Capture logs from the console
const stream = new ConsoleReadableStream();
// Split the stream in two
const [a, b] = stream.tee();

a
  // Omit only the error logs
  .pipeThrough(new OmitLogLevelStream("error"))
  // Stringify the logs to JSON
  .pipeThrough(new JsonStringifyStream())
  // Encode the output to an UTF-8 byte stream
  .pipeThrough(new TextEncoderStream())
  // Pipe the output to stdout
  .pipeTo(getStdoutWritableStream());

b
  // Pick only the error logs
  .pipeThrough(new PickLogLevelStream("error"))
  // Stringify the logs to JSON
  .pipeThrough(new JsonStringifyStream())
  // Encode the output to an UTF-8 byte stream
  .pipeThrough(new TextEncoderStream())
  // Pipe the output to stderr
  .pipeTo(getStderrWritableStream());

// Log some messages
console.error("This is going to stderr");
console.trace("This is going to stdout");
console.debug("This is going to stdout");
console.info("This is going to stdout");
console.warn("This is going to stdout");
console.log("This is going to stdout");
