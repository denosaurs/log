# Log

The denosaurs log module is a tiny, cross-platform, drop-in module for handling
logs using streams. It has been tested and works in the browser, Deno, Node and
Bun with second-class support for all runtimes and environments which implement
[web streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).

## Installation

**Log** is supported in all runtimes and environments which implement web
streams, but installation method may differ between runtimes. It is published to
[jsr](https://jsr.io/).

### Deno

Import it directly from JSR using the `jsr` protocol.

```typescript
import { ConsoleReadableStream } from "jsr:@denosaurs/log";
```

Or add it to your
[import map](https://docs.deno.com/runtime/manual/basics/import_maps) or
[`deno.json`](https://docs.deno.com/runtime/manual/getting_started/configuration_file):

```json
{
  "imports": {
    "log": "jsr:@denosaurs/log"
  }
}
```

### Node and Bun

Add this line to the project's
[.npmrc](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc) file or the
global one.

```
@jsr:registry=https://npm.jsr.io
```

And install the package using npm or the package manager of your choice.

```bash
npm install @jsr/denosaurs__log
```

If you would like a prettier package name I would suggest changing it in the
`package.json` file to something like `@denosaurs/log`.

```diff
{
  "dependencies": {
-    "@jsr/denosaurs__log": "*"
+    "@denosaurs/log": "npm:@jsr/denosaurs__log"
  }
}
```

## Examples

<details>
<summary>
Note that we use the <code>JsonStringifyStream</code> from the deno standard library in the example.
In Node, Bun and other runtimes you can install it from <a href="https://jsr.io/@std/json">jsr</a>.
</summary>

Add this line to the project's
[.npmrc](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc) file or the
global one.

```
@jsr:registry=https://npm.jsr.io
```

And install the package using npm or the package manager of your choice.

```bash
npm install @jsr/std__json
```

If you would like a prettier package name I would suggest changing it in the
`package.json` file to something like `@std/json`.

```diff
{
  "dependencies": {
-    "@jsr/std__json": "*"
+    "@std/json": "npm:@jsr/std__json"
  }
}
```

</details>

### [JSON](./examples/json.js)

The following example demonstrates how to capture and log messages as JSON to
stdout.

```typescript
// Ensure Bun compatibility. [It currently lacks support for TextEncoderStream](https://github.com/oven-sh/bun/issues/5648)
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";

import { getStdoutWritableStream } from "@denosaurs/log/writables/stdout";

import { JsonStringifyStream } from "@std/json";

// Capture logs from the console
const stream = new ConsoleReadableStream();
stream
  // Stringify the logs to JSON
  .pipeThrough(new JsonStringifyStream())
  // Encode the output to an UTF-8 byte stream
  .pipeThrough(new TextEncoderStream())
  // Pipe the output to stdout
  .pipeTo(getStdoutWritableStream());

// Log some messages
console.log("Hello, world!");
console.group("Group 1");
console.debug("Debug message");
console.groupEnd();
console.info("Info message");
```

### [Teeing](./examples/tee.js)

Sometimes you may want to log messages to multiple destinations. This can be
done using
[teeing](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#teeing_a_stream).

In the example we also use the `OmitLogLevelStream` and `PickLogLevelStream` to
filter the logs before they are written to the different destinations.

```typescript
// Ensure Bun compatibility. [It currently lacks support for TextEncoderStream](https://github.com/oven-sh/bun/issues/5648)
import "@denosaurs/log/transforms/text_encoder_stream";

import { ConsoleReadableStream } from "@denosaurs/log";

import { getStderrWritableStream } from "@denosaurs/log/writables/stderr";
import { getStdoutWritableStream } from "@denosaurs/log/writables/stdout";

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
```

## Features

The module is still young, with lot's of planned features and improvements. **It
is far from stable, so expect breaking changes.** But anyways, here are some
features:

- [ ] Add support for more runtimes and environments
  - The goal should be to support all [WinterCG](https://wintercg.org/)
    compatible runtimes
  - [x] [Deno](https://deno.land/)
  - [ ] **Untested** [Deno Deploy](https://deno.com/deploy/)
  - [x] [Node.js](https://nodejs.org/)
  - [x] [Bun](https://bun.sh/)
  - [ ] **Untested** [Cloudflare Workers](https://workers.cloudflare.com/)
  - [ ] **Untested** [Vercel Edge Runtime](https://edge-runtime.vercel.app/)
  - [ ] **Untested** [Fastly Compute](https://www.fastly.com/products/compute/)
  - [ ] **Untested** [LLRT](https://github.com/awslabs/llrt)
  - [ ] **Untested** Browsers
- [ ] Exception and rejection handling
  - [ ] Add a `fatal` log level, which will be used for unhandled exceptions and
        rejections. Unreachable from the normal `console` API.
- [ ] Metrics/timings using `console.time` and `console.timeEnd`
- [ ] Transforms
  - [x] [Filter](./transforms/filter.ts)
  - [x] [Omit](./transforms/omit.ts)
  - [x] [Pick](./transforms/pick.ts)
  - [x] JSON (Using [`JsonStringifyStream`](https://deno.land/std/json/mod.ts))
  - [x] Redaction
    - [x] `[Symbol.for("log.secret")]` (This only works when not using
          [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types)
          because `symbol`s are not cloneable. A future fix for this might be to
          write our own `structuredClone` function which keeps symbols.)
    - [x] Exact match
    - [x] Regex
    - [x] [fast-redact](https://github.com/davidmarkclements/fast-redact)
  - [ ] Request and response metadata
    - [ ] `[Symbol.for("log.request")]` or `instanceof Request`
    - [ ] `[Symbol.for("log.response")]` or `instanceof Response`
  - [ ] Pretty print
  - [ ] [Logfmt](https://brandur.org/logfmt)
- [ ] Destinations
  - [x] Console
  - [x] Stdout
  - [x] Stderr
  - [ ] File
    - [ ] Single file
    - [ ] Rotating file
  - [ ] Network
    - [ ] Fetch
    - [ ] WebSocket
    - [ ] UDP
    - [ ] TCP
  - [ ] Integrations
    - [ ] [OpenTelemetry](https://opentelemetry.io/docs/specs/otel/logs/)
    - [ ] [Logstash](https://www.elastic.co/logstash/)
- [ ] First-class support for popular web-frameworks
  - [ ] [Hono](https://github.com/honojs/hono)
  - [ ] [Express](https://github.com/expressjs/express)
  - [ ] [Koa](https://github.com/koajs/koa)
  - [ ] [Oak](https://github.com/oakserver/oak)
  - [ ] [Fastify](https://github.com/fastify/fastify)

## Goals

Some goals of this module are:

- **Web Standards** - It should to the greatest extent possible follow web
  standards and try to emulate (and in the case of `console` extend) the
  standards we already know and love.
- **Ease of use** - It should be easy to use and understand. It should be
  familiar, or dare I say, effortless to anyone who has used the `console`.
- **Minimal** - It should be as small as possible, with minimal dependencies.
  Logging doesn't have to be complicated.
- **Performance** - It needs to be fast. It should never noticeably slow down
  the application. Logging is a critical part of the application, but it should
  never be the bottleneck.
- **Quality** - It should be well tested and well documented. It should be
  reliable and trustworthy.

## Maintainers

- Elias Sjögreen ([@eliassjogreen](https://github.com/eliassjogreen))

## Contributing

Pull request, issues and feedback are very welcome. Code style is formatted with
`deno fmt` and commit messages are done following Conventional Commits spec.

Please use it! And let us know if you have any issues, feedback or requests.

## Licence

Copyright 2024, the Denosaurs team. All rights reserved. MIT license.
