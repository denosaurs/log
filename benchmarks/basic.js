// Ensure Bun compatibility. [It currently lacks support for TextEncoderStream](https://github.com/oven-sh/bun/issues/5648)
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";

import { bench, run } from "mitata";

import fs from "node:fs";
import { Writable } from "node:stream";

import { JsonStringifyStream } from "@std/json";

// @deno-types="npm:@types/bunyan"
import bunyan from "bunyan";
import bole from "bole";
import * as winston from "winston";
import { pino } from "pino";

export const isDeno = typeof Deno !== "undefined";
// @ts-expect-error: The type checking environment is deno, the bun types are not available
export const isBun = typeof process?.versions?.bun !== "undefined" &&
  "isBun" in process && process?.isBun;

async function getWebNullStream() {
  if (isDeno) {
    return (await Deno.open("/dev/null", { write: true })).writable;
  }

  if (isBun) {
    return new WritableStream({
      write: async (chunk) => {
        // @ts-expect-error: The type checking environment is deno, the bun types are not available
        await Bun.write("/dev/null", chunk);
      },
    });
  }

  return Writable.toWeb(getNodeNullStream());
}

function getNodeNullStream() {
  return fs.createWriteStream("/dev/null");
}

const bunyanLogger = bunyan.createLogger({
  name: "myapp",
  streams: [{ level: "trace", stream: getNodeNullStream() }],
});

const boleLogger = bole("myapp");
bole.output({
  level: "debug",
  stream: getNodeNullStream(),
});
bole.setFastTime(true);

const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.Stream({
      stream: getNodeNullStream(),
    }),
  ],
});

const pinoLogger = pino(getNodeNullStream());

new ConsoleReadableStream()
  .pipeThrough(new JsonStringifyStream())
  .pipeThrough(new TextEncoderStream())
  .pipeTo(await getWebNullStream());

bench("bunyan", () => bunyanLogger.info("Hello, world!"));
bench("bole", () => boleLogger.info("Hello, world!"));
bench("winston", () => winstonLogger.info("Hello, world!"));
bench("pino", () => pinoLogger.info("Hello, world!"));
bench("log", () => console.info("Hello, world!"));

await run();
