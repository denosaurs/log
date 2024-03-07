/**
 * # FilterLogLevelStream
 * 
 * A transform stream that filters logs based on their log level.
 * 
 * @example
 * ```ts
 * import { ConsoleReadableStream } from "@denosaurs/log";
 * import { FilterLogLevelStream } from "@denosaurs/log/transforms/filter";
 * import { ConsoleWritableStream } from "@denosaurs/log/writables/console";
 * 
 * // Capture logs from the console
 * const stream = new ConsoleReadableStream();
 * stream
 *   // Filter out logs with a level of "info" or higher
 *   .pipeThrough(new FilterLogLevelStream("info"))
 *   // Write the logs to the console
 *   .pipeTo(new ConsoleWritableStream());
 * 
 * // Log some messages
 * console.log("Hello, world!");
 * console.group("Group 1");
 * console.debug("Debug message");
 * console.groupEnd();
 * console.info("Info message");
 * 
 * // Output:
 * // Hello, world!
 * // Info message
 * ```
 * 
 * @module
 */

import { Log, LOG_LEVELS, LogLevel } from "../mod.ts";

/**
 * A transform stream that filters logs based on their log level.
 * 
 * @example
 * ```ts
 * import { ConsoleReadableStream } from "@denosaurs/log";
 * import { FilterLogLevelStream } from "@denosaurs/log/transforms/filter";
 * import { ConsoleWritableStream } from "@denosaurs/log/writables/console";
 * 
 * // Capture logs from the console
 * const stream = new ConsoleReadableStream();
 * stream
 *   // Filter out logs with a level of "info" or higher
 *   .pipeThrough(new FilterLogLevelStream("info"))
 *   // Write the logs to the console
 *   .pipeTo(new ConsoleWritableStream());
 * 
 * // Log some messages
 * console.log("Hello, world!");
 * console.group("Group 1");
 * console.debug("Debug message");
 * console.groupEnd();
 * console.info("Info message");
 * 
 * // Output:
 * // Hello, world!
 * // Info message
 * ```
 */
export class FilterLogLevelStream<T extends LogLevel>
  extends TransformStream<Log> {
  constructor(level: T) {
    super({
      transform(log, controller) {
        if (LOG_LEVELS[log.level] >= LOG_LEVELS[level]) {
          controller.enqueue(log);
        }
      },
    });
  }
}
