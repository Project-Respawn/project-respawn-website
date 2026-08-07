function write(level: 'info' | 'warn' | 'error', message: string, context?: unknown) {
  const entry = context === undefined ? { level, message } : { level, message, context }
  console[level](JSON.stringify(entry))
}

export const logger = {
  info: (message: string, context?: unknown) => write('info', message, context),
  warn: (message: string, context?: unknown) => write('warn', message, context),
  error: (message: string, context?: unknown) => write('error', message, context),
}
