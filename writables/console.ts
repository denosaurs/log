import { originalConsole, Log } from "../mod.ts";

/**
 * A writable stream that logs {@link Log logs} to the {@link console} using
 * the correct method for each log level.
 */
export class ConsoleWritableStream extends WritableStream<Log> {
  constructor() {
    let groups = 0;
    super({
      write(log) {
        if (log.groups.length > groups) {
          groups = log.groups.length;
          originalConsole.group(...log.groups.at(-1));
        }

        if (groups < log.groups.length) {
          originalConsole.groupEnd();
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
      },
    });
  }
}
