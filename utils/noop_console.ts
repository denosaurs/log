/**
 * A noop implementation of the {@link console} object. Useful for certain
 * environments where you wish to pass along a console implementation that does
 * nothing while still capturing the input using a {@link ConsoleReadableStream}.
 */
export const noopConsole: Console = {
  assert: () => {},
  clear: () => {},
  count: () => {},
  countReset: () => {},
  debug: () => {},
  dir: () => {},
  dirxml: () => {},
  error: () => {},
  group: () => {},
  groupCollapsed: () => {},
  groupEnd: () => {},
  info: () => {},
  log: () => {},
  table: () => {},
  time: () => {},
  timeEnd: () => {},
  timeLog: () => {},
  trace: () => {},
  warn: () => {},
  timeStamp: () => {},
  profile: () => {},
  profileEnd: () => {},
};
