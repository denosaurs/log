/**
 * # RedactStream
 *
 * A transform stream that redacts the data of the logs based on the provided options.
 *
 * By default it replaces the redacted data with the {@link redacted} symbol
 * but this can be configured using the {@link RedactOptions.replace} option.
 *
 * Any log or object containing the default {@link secret} marker symbol will
 * be automatically redacted. This can be configured using the
 * {@link RedactOptions.markers} option.
 *
 * @example
 * ```ts
 * import { ConsoleReadableStream } from "@denosaurs/log";
 * import { RedactStream, secret } from "@denosaurs/log/transforms/redact";
 * import { ConsoleWritableStream } from "@denosaurs/log/writables/console";
 *
 * // Capture logs from the console
 * const stream = new ConsoleReadableStream();
 * stream
 *   .pipeThrough(new RedactStream({ properties: ["password"] }))
 *   // Pipe the redacted logs to the console
 *   .pipeTo(new ConsoleWritableStream());
 *
 * // Log some secrets
 * console.log({ password: "lorem ipsum" });
 * console.log({ [secret]: 123 });
 * console.log([{ [secret]: 123 }]);
 *
 * // Output:
 * // { password: Symbol(redacted) }
 * // Symbol(redacted)
 * // [ Symbol(redacted) ]
 * ```
 * 
 * @module
 */

import { Log } from "../mod.ts";

/**
 * Options for the {@link redact} function and the {@link RedactStream}.
 */
export interface RedactOptions<T = typeof redacted> {
  /**
   * A list of marker symbols which when encountered will replace the whole
   * object with the `replace` value.
   *
   * @default [Symbol.for("secret")]
   */
  markers?: symbol | symbol[];
  /**
   * A list of properties to redact their values from when encountered.
   */
  properties?: (string | symbol | number)[];
  /**
   * A list of values to redact from the data when encountered.
   */
  values?: unknown[];
  /**
   * The value to replace redacted data with.
   *
   * @default Symbol.for("redacted")
   */
  replace?: T;
}

interface InnerRedactOptions {
  properties: string[];
  symbols: symbol[];
  markers: symbol[];

  tester?: RegExp;
  matcher?: RegExp;
  literals: unknown[];

  replaceValue: unknown;
  replaceString: string;
}

function escapeRegexp(regexp: string): string {
  return regexp.replace(/([()[{*+.$^\\|?])/g, "\\$1");
}

function redactProperty(
  // deno-lint-ignore no-explicit-any
  data: any,
  property: string | symbol,
  options: InnerRedactOptions,
) {
  if (options.literals.includes(data[property])) {
    data[property] = options.replaceValue;
    return;
  }

  if (typeof data[property] === "object") {
    data[property] = innerRedact(data[property], options);
    if (data[property] === options.replaceValue) {
      return;
    }
  }

  if (typeof data[property] === "string") {
    if (options.tester?.test(data[property])) {
      data[property] = options.replaceValue;
      return;
    }

    if (options.matcher !== undefined) {
      data[property] = data[property].replaceAll(
        options.matcher,
        options.replaceString,
      );

      if (data[property] === options.replaceString) {
        data[property] = options.replaceValue;
      }
    }
  }
}

// deno-lint-ignore no-explicit-any
function innerRedact(data: any, options: InnerRedactOptions) {
  if (typeof data !== "object" || data === null) {
    throw new TypeError("Can only redact from objects or arrays");
  }

  const properties = Object.getOwnPropertyNames(data);
  const symbols = Object.getOwnPropertySymbols(data);

  for (const marker of options.markers) {
    if (symbols.includes(marker)) {
      for (const property of properties) {
        try {
          delete data[property];
        } catch { /* ignore */ }
      }
      for (const symbol of symbols) {
        try {
          delete data[symbol];
        } catch { /* ignore */ }
      }

      return options.replaceValue;
    }
  }

  for (const property of properties) {
    if (options.properties.includes(property)) {
      data[property] = options.replaceValue;
    }
    redactProperty(data, property, options);
  }

  for (const symbol of symbols) {
    if (options.symbols.includes(symbol)) {
      data[symbol] = options.replaceValue;
    }
    redactProperty(data, symbol, options);
  }

  return data;
}

/**
 * The default value to replace redacted data with.
 */
export const redacted = Symbol.for("redacted");

/**
 * A marker symbol to indicate that the data is secret and should be redacted
 * when encountered.
 */
export const secret = Symbol.for("secret");

function prepareTester(values?: unknown[]): RegExp | undefined {
  if (values === undefined) return undefined;

  const testers = values.filter((value): value is RegExp =>
    value instanceof RegExp &&
    value.source.startsWith("^") &&
    value.source.endsWith("$")
  );

  if (testers.length === 0) return undefined;

  return new RegExp(testers.map((value) => `(${value.source})`).join("|"));
}

function prepareMatcher(values?: unknown[]): RegExp | undefined {
  if (values === undefined) return undefined;

  const matchers = values.filter((value): value is string | RegExp =>
    typeof value === "string" ||
    value instanceof RegExp
  ).map((value) =>
    value instanceof RegExp ? value.source : escapeRegexp(value)
  );

  if (matchers.length === 0) return undefined;

  return new RegExp(matchers.map((value) => `(${value})`).join("|"), "g");
}

function prepareOptions<T>(options: RedactOptions<T> = {}): InnerRedactOptions {
  const replaceValue = options.replace ?? redacted;

  return {
    markers: typeof options.markers === "symbol"
      ? [options.markers]
      : options.markers ?? [secret],
    properties:
      options.properties?.filter((property): property is string | number =>
        typeof property === "string" || typeof property === "number"
      ).map((property) => String(property)) ?? [],
    symbols:
      options.properties?.filter((property): property is symbol =>
        typeof property === "symbol"
      ) ?? [],
    tester: prepareTester(options.values),
    matcher: prepareMatcher(options.values),
    literals: options.values ?? [],
    replaceValue,
    replaceString: typeof replaceValue === "string"
      ? replaceValue
      : typeof replaceValue === "symbol"
      ? replaceValue.description ?? replaceValue.toString()
      : String(replaceValue),
  };
}

/**
 * Redacts the given data based on the provided options.
 *
 * This function mutates the {@link data} and returns a reference or the the
 * same element or the redacted marker, indicating that the data was redacted.
 */
export function redact<T, R>(
  data: T,
  options?: RedactOptions<R>,
): T | R {
  return innerRedact(data, prepareOptions(options));
}

/**
 * A transform stream that redacts the data of the logs based on the provided options.
 *
 * By default it replaces the redacted data with the {@link redacted} symbol
 * but this can be configured using the {@link RedactOptions.replace} option.
 *
 * Any log or object containing the default {@link secret} marker symbol will
 * be automatically redacted. This can be configured using the
 * {@link RedactOptions.markers} option.
 *
 * @example
 * ```ts
 * import { ConsoleReadableStream } from "@denosaurs/log";
 * import { RedactStream, secret } from "@denosaurs/log/transforms/redact";
 * import { ConsoleWritableStream } from "@denosaurs/log/writables/console";
 *
 * // Capture logs from the console
 * const stream = new ConsoleReadableStream();
 * stream
 *   .pipeThrough(new RedactStream({ properties: ["password"] }))
 *   // Pipe the redacted logs to the console
 *   .pipeTo(new ConsoleWritableStream());
 *
 * // Log some secrets
 * console.log({ password: "lorem ipsum" });
 * console.log({ [secret]: 123 });
 * console.log([{ [secret]: 123 }]);
 *
 * // Output:
 * // { password: Symbol(redacted) }
 * // Symbol(redacted)
 * // [ Symbol(redacted) ]
 * ```
 */
// deno-fmt-ignore
// deno-lint-ignore no-explicit-any
export class RedactStream<T = typeof redacted> extends TransformStream<Log, Log & { data: any[] | T }> {
  constructor(options?: RedactOptions<T>) {
    options ??= {};
    options.replace ??= redacted as T;
    super({
      transform(log, controller) {
        // deno-lint-ignore no-explicit-any
        (log.data as any[] | T) = redact(log.data, options);
        controller.enqueue(log);
      },
    });
  }
}
