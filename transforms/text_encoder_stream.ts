/**
 * An implementation of the {@link TextEncoderStream} for
 * [bun](https://github.com/oven-sh/bun/issues/5648)
 * and other runtimes lacking support.
 */
export class TextEncoderStream extends TransformStream<string, Uint8Array> {
  constructor() {
    const encoder = new TextEncoder();
    super({
      transform(chunk, controller) {
        controller.enqueue(encoder.encode(chunk));
      },
    });
  }
}

if (typeof globalThis.TextEncoderStream === "undefined") {
  Object.defineProperty(globalThis, "TextEncoderStream", {
    get: () => TextEncoderStream,
  });
}
