import type { Log, LogLevel } from "../mod.ts";

/**
 * A transform stream that omits logs by their log level.
 */
export class OmitLogLevelStream<T extends LogLevel>
  extends TransformStream<Log> {
  constructor(level: T) {
    super({
      transform(log, controller) {
        if (log.level !== level) {
          controller.enqueue(log);
        }
      },
    });
  }
}
