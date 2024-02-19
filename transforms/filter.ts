import { Log, LOG_LEVELS, LogLevel } from "../mod.ts";

/**
 * A transform stream that filters logs based on their log level.
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
