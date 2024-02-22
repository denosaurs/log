import { Log } from "../mod.ts";

export interface RedactOptions {
  properties?: (string | symbol | number)[];
  values?: unknown[];
  replace?: unknown;
}

interface PreparedRedactOptions {
  properties: string[];
  symbols: symbol[];

  tester?: RegExp;
  matcher?: RegExp;
  literals: unknown[];

  replaceValue: unknown;
  replaceString: string;
}

function escapeRegexp(regexp: string): string {
  return regexp.replace(/([()[{*+.$^\\|?])/g, "\\$1");
}

function innerRedact(data: any, options: PreparedRedactOptions) {
  if (typeof data !== "object" || data === null) {
    throw new TypeError("Can only redact from objects or arrays");
  }

  const properties = Object.getOwnPropertyNames(data);
  const symbols = Object.getOwnPropertySymbols(data);

  for (const property of properties) {
    if (options.properties.includes(property)) {
      Object.defineProperty(data, property, {
        get: () => options.replaceValue,
      });
    }

    if (options.literals.includes(data[property])) {
      data[property] = options.replaceValue;
      continue;
    }

    if (typeof data[property] === "object") {
      innerRedact(data[property], options);
    }

    if (typeof data[property] === "string") {
      if (options.tester?.test(data[property])) {
        data[property] = options.replaceValue;
        continue;
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

  for (const symbol of symbols) {
    if (options.symbols.includes(symbol)) {
      Object.defineProperty(data, symbol, {
        get: () => options.replaceValue,
      });
    }

    if (options.literals.includes(data[symbol])) {
      data[symbol] = options.replaceValue;
      continue;
    }

    if (typeof data[symbol] === "object") {
      innerRedact(data[symbol], options);
    }

    if (typeof data[symbol] === "string") {
      if (options.tester?.test(data[symbol])) {
        data[symbol] = options.replaceValue;
        continue;
      }

      if (options.matcher !== undefined) {
        data[symbol] = data[symbol].replaceAll(
          options.matcher,
          options.replaceString,
        );
        
        if (data[symbol] === options.replaceString) {
          data[symbol] = options.replaceValue;
        }
      }
    }
  }
}

/**
 * The default value to replace redacted data with.
 */
export const redacted = Symbol.for("redacted");

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

function prepareOptions(options: RedactOptions): PreparedRedactOptions {
  const replaceValue = options.replace ?? redacted;

  return {
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

export function redact(data: any, options: RedactOptions) {
  innerRedact(data, prepareOptions(options));
}

export class RedactStream extends TransformStream<Log> {
  constructor(options: RedactOptions) {
    super({
      transform(log, controller) {
        redact(log.data, options);
        controller.enqueue(log);
      },
    });
  }
}
