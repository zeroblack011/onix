/**
 * Sistema de Logging
 * Logs estruturados para monitoramento
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  userId?: string
  requestId?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private createEntry(
    level: LogLevel,
    message: string,
    data?: any,
    metadata?: { userId?: string; requestId?: string }
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...metadata,
    }

    this.logs.push(entry)

    // Mantém apenas os últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    return entry
  }

  info(message: string, data?: any, metadata?: { userId?: string; requestId?: string }) {
    const entry = this.createEntry('info', message, data, metadata)
    console.log(`[INFO] ${message}`, data)
    return entry
  }

  warn(message: string, data?: any, metadata?: { userId?: string; requestId?: string }) {
    const entry = this.createEntry('warn', message, data, metadata)
    console.warn(`[WARN] ${message}`, data)
    return entry
  }

  error(message: string, error?: any, metadata?: { userId?: string; requestId?: string }) {
    const entry = this.createEntry('error', message, error, metadata)
    console.error(`[ERROR] ${message}`, error)

    // Em produção, enviar para Sentry
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Sentry.captureException(error)
    }

    return entry
  }

  debug(message: string, data?: any, metadata?: { userId?: string; requestId?: string }) {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createEntry('debug', message, data, metadata)
      console.debug(`[DEBUG] ${message}`, data)
      return entry
    }
  }

  getLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filtered = this.logs

    if (level) {
      filtered = filtered.filter((log) => log.level === level)
    }

    return filtered.slice(-limit)
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()
