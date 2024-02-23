/**
 * A copy of the original console object.
 */
export const originalConsole: Console = {
  assert: console?.assert.bind(console),
  clear: console?.clear.bind(console),
  count: console?.count.bind(console),
  countReset: console?.countReset.bind(console),
  debug: console?.debug.bind(console),
  dir: console?.dir.bind(console),
  dirxml: console?.dirxml.bind(console),
  error: console?.error.bind(console),
  group: console?.group.bind(console),
  groupCollapsed: console?.groupCollapsed.bind(console),
  groupEnd: console?.groupEnd.bind(console),
  info: console?.info.bind(console),
  log: console?.log.bind(console),
  table: console?.table.bind(console),
  time: console?.time.bind(console),
  timeEnd: console?.timeEnd.bind(console),
  timeLog: console?.timeLog.bind(console),
  trace: console?.trace.bind(console),
  warn: console?.warn.bind(console),
  timeStamp: console?.timeStamp.bind(console),
  profile: console?.profile.bind(console),
  profileEnd: console?.profileEnd.bind(console),
};

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

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

/**
 * A log object that represents a single log entry.
 */
export interface Log {
  /** A millisecond resolution unix timestamp of when the log was made */
  timestamp: number;
  level: LogLevel;
  // deno-lint-ignore no-explicit-any
  groups: any[];
  // deno-lint-ignore no-explicit-any
  data: any[];
}

export interface ConsoleReadableStreamOptions {
  internals: {
    /**
     * @returns A millisecond resolution unix timestamp of when the log was made
     */
    now: () => number;
    /**
     * Clones the given data so that references are not shared between logs.
     */
    clone: <T>(data: T) => T;
  };
}

/**
 * Default options for the {@link ConsoleReadableStreamOptions}. It uses normal
 * resolution timestamps by calling `Date.now()` and a deep cloning by
 * using the structured clone algorithm.
 */
export const defaultConsoleReadableStreamOptions: ConsoleReadableStreamOptions =
  {
    internals: {
      now: Date.now,
      clone: <T>(data: T) => {
        if (
          typeof data === "string" ||
          typeof data === "number" ||
          typeof data === "boolean" ||
          data === null ||
          data === undefined
        ) {
          return data;
        }

        return structuredClone(data);
      },
    },
  };

/**
 * This is the fastest option, but it may not be suitable for all use cases.
 * Read the caution below before using these default options.
 *
 * Fast defaults for the {@link ConsoleReadableStreamOptions}. It uses normal
 * resolution timestamps by calling `Date.now()` and a shallow cloning by
 * transforming the data to `JSON` and back.
 *
 * Caution: This option only supports JSON-serializable data and data may be
 * lost in the process making future transforms which rely on non-json types
 * impossible. If you need to support non-json types, you should use the
 * {@link defaultConsoleReadableStreamOptions} instead.
 */
export const fastConsoleReadableStreamOptions: ConsoleReadableStreamOptions = {
  internals: {
    now: Date.now,
    clone: <T>(data: T) => {
      if (
        typeof data === "string" ||
        typeof data === "number" ||
        typeof data === "boolean" ||
        data === null ||
        data === undefined
      ) {
        return data;
      }

      return JSON.parse(JSON.stringify(data));
    },
  },
};

/**
 * This is the most accurate option, but may suffer from a slight performance
 * penalty by using high resolution timestamps and a deep cloning by using the
 * structured clone algorithm.
 *
 * Use this option if you need to support non-json types and need high
 * resolution timestamps.
 */
export const hrtimeConsoleReadableStreamOptions: ConsoleReadableStreamOptions =
  {
    internals: {
      now: () => performance.timeOrigin + performance.now(),
      clone: <T>(data: T) => {
        if (
          typeof data === "string" ||
          typeof data === "number" ||
          typeof data === "boolean" ||
          data === null ||
          data === undefined
        ) {
          return data;
        }

        return structuredClone(data);
      },
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
  #options: ConsoleReadableStreamOptions;

  constructor(
    options: RecursivePartial<ConsoleReadableStreamOptions> =
      defaultConsoleReadableStreamOptions,
  ) {
    options ??= defaultConsoleReadableStreamOptions;
    options.internals ??= defaultConsoleReadableStreamOptions.internals;
    options.internals.now ??= defaultConsoleReadableStreamOptions.internals.now;
    options.internals.clone ??=
      defaultConsoleReadableStreamOptions.internals.clone;

    let controller: ReadableStreamDefaultController<Log>;
    // deno-lint-ignore no-explicit-any
    const groups: any[] = [];

    super({
      start(defaultController) {
        controller = defaultController;
      },
    });

    this.#options = options as ConsoleReadableStreamOptions;

    // deno-lint-ignore no-explicit-any
    const wrapper = (level: LogLevel) => (...data: any[]) => {
      controller.enqueue({
        timestamp: this.#options.internals.now(),
        level,
        groups: this.#options.internals.clone(groups),
        data: this.#options.internals.clone(data),
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
        // deno-lint-ignore no-explicit-any
        value: (...data: any) => {
          groups.push(data);
        },
        writable: true,
        enumerable: true,
        configurable: true,
      },
      groupCollapsed: {
        // deno-lint-ignore no-explicit-any
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

  // deno-lint-ignore no-explicit-any
  cancel(reason?: any): Promise<void> {
    globalThis.console = originalConsole;
    return super.cancel(reason);
  }
}
