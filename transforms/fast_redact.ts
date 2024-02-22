import type { Log } from "../mod.ts";
import type { RedactOptions } from "npm:@types/fast-redact@3";

// @deno-types="npm:@types/fast-redact"
import redact from "npm:fast-redact@3";

export type FastRedactOptions = RedactOptions;

/**
 * Redacts data from logs. This is useful for removing sensitive information
 * such as identifying information, tokens, etc. from logs.
 *
 * It uses the [`fast-redact`](https://github.com/davidmarkclements/fast-redact)
 * package to redact the data from logs.
 */
export class FastRedactOptionsStream extends TransformStream<Log> {
  constructor(options: FastRedactOptions) {
    const redactor = redact(options);
    super({
      transform(log, controller) {
        log.data = log.data.map((value) => redactor(value));
        controller.enqueue(log);
      },
    });
  }
}
