// ログシステム - 構造化ログとエラートラッキング

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
  userId?: string;
  coupleId?: string;
  requestId?: string;
  action?: string;
  feature?: string;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) ||
    (this.isProduction ? 'info' : 'debug');

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    if (this.isProduction) {
      // 本番環境: JSON形式で出力
      console.log(JSON.stringify(entry));
    } else {
      // 開発環境: 読みやすい形式で出力
      const timestamp = entry.timestamp;
      const level = entry.level.toUpperCase().padEnd(5);
      const contextStr = entry.context
        ? ` | ${JSON.stringify(entry.context)}`
        : '';
      const errorStr = entry.error ? ` | ERROR: ${entry.error.message}` : '';

      console.log(
        `[${timestamp}] ${level} | ${entry.message}${contextStr}${errorStr}`
      );

      if (entry.error?.stack && entry.level === 'error') {
        console.log(entry.error.stack);
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.writeLog(this.formatLogEntry('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    this.writeLog(this.formatLogEntry('info', message, context));
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.writeLog(this.formatLogEntry('warn', message, context, error));
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.writeLog(this.formatLogEntry('error', message, context, error));
  }

  // 認証関連のログ
  auth = {
    signup: (email: string, success: boolean, error?: Error) => {
      this.info('ユーザー登録試行', {
        action: 'signup',
        feature: 'auth',
        email: this.maskEmail(email),
        success,
      });
      if (error) {
        this.error(
          'ユーザー登録失敗',
          {
            action: 'signup',
            feature: 'auth',
            email: this.maskEmail(email),
          },
          error
        );
      }
    },

    signin: (email: string, success: boolean, error?: Error) => {
      this.info('ログイン試行', {
        action: 'signin',
        feature: 'auth',
        email: this.maskEmail(email),
        success,
      });
      if (error) {
        this.error(
          'ログイン失敗',
          {
            action: 'signin',
            feature: 'auth',
            email: this.maskEmail(email),
          },
          error
        );
      }
    },

    signout: (userId: string) => {
      this.info('ログアウト', {
        action: 'signout',
        feature: 'auth',
        userId,
      });
    },
  };

  // データベース関連のログ
  database = {
    query: (
      table: string,
      operation: string,
      success: boolean,
      error?: Error
    ) => {
      this.debug('データベース操作', {
        action: operation,
        feature: 'database',
        table,
        success,
      });
      if (error) {
        this.error(
          'データベースエラー',
          {
            action: operation,
            feature: 'database',
            table,
          },
          error
        );
      }
    },

    migration: (version: string, success: boolean, error?: Error) => {
      this.info('データベースマイグレーション', {
        action: 'migration',
        feature: 'database',
        version,
        success,
      });
      if (error) {
        this.error(
          'マイグレーションエラー',
          {
            action: 'migration',
            feature: 'database',
            version,
          },
          error
        );
      }
    },
  };

  // API関連のログ
  api = {
    request: (
      method: string,
      path: string,
      userId?: string,
      requestId?: string
    ) => {
      this.info('API リクエスト', {
        action: 'request',
        feature: 'api',
        method,
        path,
        userId,
        requestId,
      });
    },

    response: (
      method: string,
      path: string,
      status: number,
      duration?: number,
      userId?: string,
      requestId?: string
    ) => {
      this.info('API レスポンス', {
        action: 'response',
        feature: 'api',
        method,
        path,
        status,
        duration,
        userId,
        requestId,
      });
    },

    error: (
      method: string,
      path: string,
      error: Error,
      userId?: string,
      requestId?: string
    ) => {
      this.error(
        'API エラー',
        {
          action: 'error',
          feature: 'api',
          method,
          path,
          userId,
          requestId,
        },
        error
      );
    },
  };

  // 支出関連のログ
  expense = {
    create: (
      userId: string,
      coupleId: string,
      amount: number,
      success: boolean,
      error?: Error
    ) => {
      this.info('支出作成', {
        action: 'create',
        feature: 'expense',
        userId,
        coupleId,
        amount,
        success,
      });
      if (error) {
        this.error(
          '支出作成エラー',
          {
            action: 'create',
            feature: 'expense',
            userId,
            coupleId,
          },
          error
        );
      }
    },

    update: (
      expenseId: string,
      userId: string,
      coupleId: string,
      success: boolean,
      error?: Error
    ) => {
      this.info('支出更新', {
        action: 'update',
        feature: 'expense',
        expenseId,
        userId,
        coupleId,
        success,
      });
      if (error) {
        this.error(
          '支出更新エラー',
          {
            action: 'update',
            feature: 'expense',
            expenseId,
            userId,
            coupleId,
          },
          error
        );
      }
    },

    delete: (
      expenseId: string,
      userId: string,
      coupleId: string,
      success: boolean,
      error?: Error
    ) => {
      this.info('支出削除', {
        action: 'delete',
        feature: 'expense',
        expenseId,
        userId,
        coupleId,
        success,
      });
      if (error) {
        this.error(
          '支出削除エラー',
          {
            action: 'delete',
            feature: 'expense',
            expenseId,
            userId,
            coupleId,
          },
          error
        );
      }
    },
  };

  // 精算関連のログ
  settlement = {
    create: (
      userId: string,
      coupleId: string,
      amount: number,
      success: boolean,
      error?: Error
    ) => {
      this.info('精算作成', {
        action: 'create',
        feature: 'settlement',
        userId,
        coupleId,
        amount,
        success,
      });
      if (error) {
        this.error(
          '精算作成エラー',
          {
            action: 'create',
            feature: 'settlement',
            userId,
            coupleId,
          },
          error
        );
      }
    },

    complete: (
      settlementId: string,
      userId: string,
      coupleId: string,
      success: boolean,
      error?: Error
    ) => {
      this.info('精算完了', {
        action: 'complete',
        feature: 'settlement',
        settlementId,
        userId,
        coupleId,
        success,
      });
      if (error) {
        this.error(
          '精算完了エラー',
          {
            action: 'complete',
            feature: 'settlement',
            settlementId,
            userId,
            coupleId,
          },
          error
        );
      }
    },
  };

  // セキュリティ関連のログ
  security = {
    unauthorized: (path: string, ip?: string, userAgent?: string) => {
      this.warn('未認証アクセス試行', {
        action: 'unauthorized',
        feature: 'security',
        path,
        ip,
        userAgent,
      });
    },

    rateLimitExceeded: (ip: string, path: string) => {
      this.warn('レート制限超過', {
        action: 'rateLimit',
        feature: 'security',
        ip,
        path,
      });
    },

    suspiciousActivity: (
      userId: string,
      activity: string,
      details?: LogContext
    ) => {
      this.warn('不審なアクティビティ', {
        action: 'suspicious',
        feature: 'security',
        userId,
        activity,
        ...details,
      });
    },
  };

  // メールアドレスをマスクする（プライバシー保護）
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.substring(0, 2)}***@${domain}`;
  }
}

// シングルトンインスタンス
export const logger = new Logger();

// エラーハンドリング用のヘルパー関数
export const withLogging = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  feature: string,
  action: string
): T => {
  return (async (...args: unknown[]) => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      logger.debug(`${feature}.${action} 成功`, {
        feature,
        action,
        duration,
        success: true,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        `${feature}.${action} 失敗`,
        {
          feature,
          action,
          duration,
          success: false,
        },
        error as Error
      );
      throw error;
    }
  }) as T;
};

// パフォーマンス測定用のヘルパー
export const measurePerformance = <T>(
  operation: string,
  fn: () => T | Promise<T>
): T | Promise<T> => {
  const startTime = Date.now();

  const logCompletion = (success: boolean, error?: Error) => {
    const duration = Date.now() - startTime;
    if (success) {
      logger.debug(`パフォーマンス測定: ${operation}`, {
        feature: 'performance',
        operation,
        duration,
        success,
      });
    } else {
      logger.warn(
        `パフォーマンス測定: ${operation} (エラー)`,
        {
          feature: 'performance',
          operation,
          duration,
          success,
        },
        error
      );
    }
  };

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then(value => {
          logCompletion(true);
          return value;
        })
        .catch(error => {
          logCompletion(false, error);
          throw error;
        });
    } else {
      logCompletion(true);
      return result;
    }
  } catch (error) {
    logCompletion(false, error as Error);
    throw error;
  }
};
