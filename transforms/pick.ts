import { Log, LogLevel } from "../mod.ts";

/**
 * A transform stream that picks logs by their log level.
 */
export class PickLogLevelStream<T extends LogLevel>
  extends TransformStream<Log> {
  constructor(level: T) {
    super({
      transform(log, controller) {
        if (log.level === level) {
          controller.enqueue(log);
        }
      },
    });
  }
}
