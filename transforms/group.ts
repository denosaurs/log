/**
 * # FilterLogLevelStream
 *
 * A transform stream that filters logs based on their log level.
 *
 * @module
 */

import { Log } from "../mod.ts";

/**
 * A transform stream that adds a group or groups to a log entry.
 */
export class GroupStream extends TransformStream<Log> {
  // deno-lint-ignore no-explicit-any
  constructor(...groups: any[][]) {
    super({
      transform(chunk, controller) {
        chunk.groups.unshift(...groups);
        controller.enqueue(chunk);
      },
    });
  }
}
