export const isDeno = typeof Deno !== "undefined";
// @ts-expect-error: The type checking environment is deno, the bun types are not available
export const isBun = typeof process?.versions?.bun !== "undefined" &&
  "isBun" in process && process?.isBun;
// @ts-expect-error: The type checking environment is deno, the node types are not available
export const isNode = typeof process !== "undefined" && !isDeno && !isBun;
// @ts-expect-error: The type checking environment is deno, the browser types are not available
export const isBrowser = typeof globalThis !== "undefined" &&
  typeof globalThis.document?.createElement !== "undefined";

export const environment = isDeno
  ? "deno"
  : isBun
  ? "bun"
  : isNode
  ? "node"
  : isBrowser
  ? "browser"
  : "unknown";
