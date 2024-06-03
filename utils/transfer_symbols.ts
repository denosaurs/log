/**
 * Transfer symbols and their values as is from {@link value} to {@link target}.
 */
export function transferSymbols<T>(value: T, target: T): T {
  if (
    value === null || value === undefined ||
    target === null || target === undefined
  ) return target;

  const properties = Object.getOwnPropertyNames(value) as (keyof T)[];
  const symbols = Object.getOwnPropertySymbols(value) as (keyof T)[];

  for (const property of properties) {
    const entry = value[property];

    if (typeof entry === "symbol") {
      target[property] = entry;
    }

    if (typeof entry !== "object") {
      continue;
    }

    target[property] = transferSymbols(entry, target[property]);
  }

  for (const symbol of symbols) {
    target[symbol] = value[symbol];
  }

  return target;
}
