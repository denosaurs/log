// deno-lint-ignore-file no-explicit-any

const console = globalThis.console;

export type LogLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error";

export const LOG_LEVELS: { [level in LogLevel]: number } = {
  "trace": 1,
  "debug": 2,
  "info": 3,
  "warn": 4,
  "error": 5,
};

export interface Log {
  /** A millisecond resolution unix timestamp of when the log was made */
  timestamp: number;
  level: LogLevel;
  groups: any[];
  data: any[];
}

export interface ConsoleReadableStreamOptions {
  internals: {
    now: () => number;
    clone: <T>(data: T) => T;
  };
}

export const defaultConsoleReadableStreamOptions: ConsoleReadableStreamOptions =
  {
    internals: {
      now: () => performance.timeOrigin + performance.now(),
      clone: <T>(data: T) => structuredClone(data),
    },
  };

/**
 * A readable stream that captures all console methods and turns them into a
 * stream of {@link Log logs}.
 *
 * Note that it automatically replaces the global {@link console} object with a
 * new one that captures all logs. To restore the original {@link console}
 * object, call the {@link ConsoleReadableStream.cancel} method.
 */
export class ConsoleReadableStream extends ReadableStream<Log> {
  constructor(
    options: ConsoleReadableStreamOptions = defaultConsoleReadableStreamOptions,
  ) {
    let controller: ReadableStreamDefaultController<Log>;
    const groups: any[] = [];

    super({
      start(defaultController) {
        controller = defaultController;
      },
    });

    const wrapper = (level: LogLevel) => (...data: any[]) => {
      controller.enqueue({
        timestamp: options.internals.now(),
        level,
        groups: groups.length === 0 ? [] : options.internals.clone(groups),
        data: options.internals.clone(data),
      });
    };

    Object.defineProperties(globalThis.console, {
      trace: {
        value: wrapper("trace"),
        writable: true,
        enumerable: true,
        configurable: true,
      },
      debug: {
        value: wrapper("debug"),
        writable: true,
        enumerable: true,
        configurable: true,
      },
      info: {
        value: wrapper("info"),
        writable: true,
        enumerable: true,
        configurable: true,
      },
      log: {
        value: wrapper("info"),
        writable: true,
        enumerable: true,
        configurable: true,
      },
      warn: {
        value: wrapper("warn"),
        writable: true,
        enumerable: true,
        configurable: true,
      },
      error: {
        value: wrapper("error"),
        writable: true,
        enumerable: true,
        configurable: true,
      },

      group: {
        value: (...data: any) => {
          groups.push(data);
        },
        writable: true,
        enumerable: true,
        configurable: true,
      },
      groupCollapsed: {
        value: (...data: any) => {
          groups.push(data);
        },
        writable: true,
        enumerable: true,
        configurable: true,
      },
      groupEnd: {
        value: () => {
          groups.pop();
        },
        writable: true,
        enumerable: true,
        configurable: true,
      },
    });
  }

  cancel(reason?: any): Promise<void> {
    globalThis.console = console;
    return super.cancel(reason);
  }
}
