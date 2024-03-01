// Ensure Bun compatibility. [It currently lacks support for TextEncoderStream](https://github.com/oven-sh/bun/issues/5648)
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";

import { RedactStream } from "@denosaurs/log/transforms/redact";
import { getStdoutWritableStream } from "@denosaurs/log/writables/stdout";

import { JsonStringifyStream } from "@std/json";

// Capture logs from the console
const stream = new ConsoleReadableStream();
stream
  .pipeThrough(new RedactStream({ properties: ["password"] }))
  // Stringify the logs to JSON
  .pipeThrough(new JsonStringifyStream())
  // Encode the output to an UTF-8 byte stream
  .pipeThrough(new TextEncoderStream())
  // Pipe the output to stdout
  .pipeTo(getStdoutWritableStream());

// Log a secret
const thisIsSecret = { password: "lorem ipsum" };
console.log(thisIsSecret);
