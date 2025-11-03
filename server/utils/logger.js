/**
 * Centralized logging utility
 * Supports different log levels and formats
 */

import config from '../config/index.js';

class Logger {
  constructor() {
    this.level = config.logging.level;
    this.levels = ['error', 'warn', 'info', 'debug'];
  }

  shouldLog(level) {
    return this.levels.indexOf(level) <= this.levels.indexOf(this.level);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const baseLog = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
    };

    if (config.logging.format === 'json') {
      return JSON.stringify(baseLog);
    }

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''}`;
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);

    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
}

export default new Logger();
