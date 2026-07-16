type Level = 'debug' | 'info' | 'warn' | 'error';

const PREFIX = '[VizVoice]';

function fmt(level: Level, ...args: unknown[]) {
  const ts = new Date().toISOString().slice(11, 23);
  console[level === 'debug' ? 'log' : level](`${PREFIX} ${ts}`, ...args);
}

export const log = {
  debug: (...a: unknown[]) => fmt('debug', ...a),
  info:  (...a: unknown[]) => fmt('info',  ...a),
  warn:  (...a: unknown[]) => fmt('warn',  ...a),
  error: (...a: unknown[]) => fmt('error', ...a),
};
