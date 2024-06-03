import type { Log } from "../mod.ts";
import { originalConsole } from "../utils/original_console.ts";

/**
 * A writable stream that logs {@link Log logs} to the {@link console} using
 * the correct method for each log level.
 */
export class ConsoleWritableStream extends WritableStream<Log> {
  constructor() {
    super({
      write(log) {
        for (const group of log.groups) {
          originalConsole.group(...group);
        }

        switch (log.level) {
          case "trace": {
            originalConsole.trace(...log.data);
            break;
          }
          case "debug": {
            originalConsole.debug(...log.data);
            break;
          }
          case "info": {
            originalConsole.info(...log.data);
            break;
          }
          case "warn": {
            originalConsole.warn(...log.data);
            break;
          }
          case "error": {
            originalConsole.error(...log.data);
            break;
          }
        }

        for (let i = 0; i < log.groups.length; i++) {
          originalConsole.groupEnd();
        }
      },
    });
  }
}
