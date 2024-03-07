// Ensure Bun compatibility. [It currently lacks support for TextEncoderStream](https://github.com/oven-sh/bun/issues/5648)
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";

import { RedactStream, secret } from "@denosaurs/log/transforms/redact";
import { ConsoleWritableStream } from "@denosaurs/log/writables/console";

// Capture logs from the console
const stream = new ConsoleReadableStream();
stream
  .pipeThrough(new RedactStream({ properties: ["password"] }))
  // Pipe the redacted logs to the console
  .pipeTo(new ConsoleWritableStream());

// Log a secret
console.log({ password: "lorem ipsum" });
console.log({ [secret]: 123 });
console.log([{ [secret]: 123 }]);
