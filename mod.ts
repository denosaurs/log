import { transferSymbols } from "./utils/transfer_symbols.ts";

/**
 * Create a function that restores the given console to its original state.
 */
function createRestoreConsole(original: Console) {
  const methods: PropertyDescriptorMap = {
    assert: {
      value: original?.assert.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    clear: {
      value: original?.clear.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    count: {
      value: original?.count.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    countReset: {
      value: original?.countReset.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    debug: {
      value: original?.debug.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    dir: {
      value: original?.dir.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    dirxml: {
      value: original?.dirxml.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    error: {
      value: original?.error.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    group: {
      value: original?.group.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    groupCollapsed: {
      value: original?.groupCollapsed.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    groupEnd: {
      value: original?.groupEnd.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    info: {
      value: original?.info.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    log: {
      value: original?.log.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    table: {
      value: original?.table.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    time: {
      value: original?.time.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    timeEnd: {
      value: original?.timeEnd.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    timeLog: {
      value: original?.timeLog.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    trace: {
      value: original?.trace.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    warn: {
      value: original?.warn.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    timeStamp: {
      value: original?.timeStamp.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    profile: {
      value: original?.profile.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
    profileEnd: {
      value: original?.profileEnd.bind(original),
      writable: true,
      enumerable: true,
      configurable: true,
    },
  };

  return (console: Console) => Object.defineProperties(console, methods);
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * All of the log levels that are supported by the console.
 */
export type LogLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error";

/**
 * A numeric representation of the log levels to be able to compare log levels.
 * The lower the number, the more verbose the log level. The higher the number,
 * the more severe the log level.
 */
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
  /** The log level of the log. */
  level: LogLevel;
  /**
   * An array of groups that were active when the log was made. The groups are
   * a clone of the array of all the arguments that were passed to the console
   * `group` and `groupCollapsed` methods as to never modify any potential
   * references.
   *
   * @example
   * ```ts
   * console.group("group1", "group2");
   * console.group("group3");
   * console.log("Hello, world!");
   * // Would result in the following groups:
   * // [["group1", "group2"], ["group3"]]
   * ```
   */
  // deno-lint-ignore no-explicit-any
  groups: any[][];
  /**
   * The data that was logged. It is a clone of the array of all the arguments
   * that were passed to the console method which made the log as to never
   * modify any potential references.
   */
  // deno-lint-ignore no-explicit-any
  data: any[];
}

/**
 * Options for the {@link ConsoleReadableStream}.
 */
export interface ConsoleReadableStreamOptions {
  /**
   * The console object to capture logs from. The object will be modified to
   * capture all logs and will be restored to its original state when the
   * stream is closed.
   *
   * @default globalThis.console
   */
  console: Console;
  /**
   * Internal methods and configuration. Depending on the options, the
   * performance, supported features and timestamp accuracy may vary.
   *
   * @default defaultConsoleReadableStreamOptions
   */
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
    console: globalThis.console,
    internals: {
      now: Date.now,
      clone: <T>(data: T) => transferSymbols(data, structuredClone(data)),
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
  console: globalThis.console,
  internals: {
    now: Date.now,
    clone: <T>(data: T) =>
      transferSymbols(data, JSON.parse(JSON.stringify(data))),
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
    console: globalThis.console,
    internals: {
      now: () => performance.timeOrigin + performance.now(),
      clone: <T>(data: T) => transferSymbols(data, structuredClone(data)),
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
  #restore: (console: Console) => Console;
  #close: () => void;

  constructor(
    options: RecursivePartial<ConsoleReadableStreamOptions> =
      defaultConsoleReadableStreamOptions,
  ) {
    options ??= defaultConsoleReadableStreamOptions;
    options.console ??= defaultConsoleReadableStreamOptions.console;
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
    this.#restore = createRestoreConsole(this.#options.console);
    this.#close = () => controller.close();

    // deno-lint-ignore no-explicit-any
    const wrapper = (level: LogLevel) => (...data: any[]) => {
      controller.enqueue({
        timestamp: this.#options.internals.now(),
        level,
        groups: this.#options.internals.clone(groups),
        data: this.#options.internals.clone(data),
      });
    };

    Object.defineProperties(options.console, {
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

  /**
   * Closes the stream and restores the original console object.
   */
  close() {
    this.#close();
    this.#options.console = this.#restore(this.#options.console);
  }

  // deno-lint-ignore no-explicit-any
  cancel(reason?: any): Promise<void> {
    this.close();
    return super.cancel(reason);
  }
}
