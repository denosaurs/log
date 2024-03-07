/**
 * A copy of the original {@link console} object.
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
