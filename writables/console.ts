import { Log } from "../mod.ts";

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
          console.group(log.groups.at(-1));
        }

        if (groups < log.groups.length) {
          console.groupEnd();
        }

        switch (log.level) {
          case "trace": {
            console.trace(log.data);
            break;
          }
          case "debug": {
            console.debug(log.data);
            break;
          }
          case "info": {
            console.info(log.data);
            break;
          }
          case "warn": {
            console.warn(log.data);
            break;
          }
          case "error": {
            console.error(log.data);
            break;
          }
        }
      },
    });
  }
}
