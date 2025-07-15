// 環境変数の管理とバリデーション

import { logger } from './logger';

export interface EnvironmentConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // NextAuth
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;

  // OAuth (オプション)
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;

  // その他
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
}

class EnvironmentValidator {
  private config: Partial<EnvironmentConfig> = {};

  constructor() {
    this.loadEnvironment();
    this.validateRequired();
  }

  private loadEnvironment(): void {
    this.config = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
      LOG_LEVEL: process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
    };
  }

  private validateRequired(): void {
    // サーバーサイドでのみ検証する環境変数
    const isServer = typeof window === 'undefined';

    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    // サーバーサイドでのみ必要な環境変数
    if (isServer) {
      requiredEnvVars.push(
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET'
      );
    }

    const missingVars: string[] = [];

    for (const varName of requiredEnvVars) {
      const value = this.config[varName as keyof EnvironmentConfig];
      if (!value || value === '') {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      const errorMessage = `必須の環境変数が設定されていません: ${missingVars.join(', ')}`;
      // ログの循環参照を避けるため、直接console.errorを使用
      console.error('[ENV_ERROR]', errorMessage, { missing_vars: missingVars });
      throw new Error(errorMessage);
    }

    // URL形式のバリデーション
    this.validateUrls();

    // OAuth設定のバリデーション
    this.validateOAuthProviders();

    logger.info('環境変数の検証が完了しました', {
      feature: 'environment',
      action: 'validation',
      environment: this.config.NODE_ENV,
      oauth_providers: this.getConfiguredOAuthProviders(),
    });
  }

  private validateUrls(): void {
    const urlVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXTAUTH_URL'];

    for (const varName of urlVars) {
      const value = this.config[varName as keyof EnvironmentConfig];
      if (value && !this.isValidUrl(value)) {
        const errorMessage = `${varName} は有効なURLである必要があります: ${value}`;
        logger.error(errorMessage, {
          feature: 'environment',
          action: 'url_validation',
          variable: varName,
          value,
        });
        throw new Error(errorMessage);
      }
    }
  }

  private validateOAuthProviders(): void {
    // Google OAuth
    if (this.config.GOOGLE_CLIENT_ID || this.config.GOOGLE_CLIENT_SECRET) {
      if (!this.config.GOOGLE_CLIENT_ID || !this.config.GOOGLE_CLIENT_SECRET) {
        logger.warn(
          'Google OAuth設定が不完全です。GOOGLE_CLIENT_IDとGOOGLE_CLIENT_SECRETの両方が必要です',
          {
            feature: 'environment',
            action: 'oauth_validation',
            provider: 'google',
          }
        );
      }
    }

    // GitHub OAuth
    if (this.config.GITHUB_CLIENT_ID || this.config.GITHUB_CLIENT_SECRET) {
      if (!this.config.GITHUB_CLIENT_ID || !this.config.GITHUB_CLIENT_SECRET) {
        logger.warn(
          'GitHub OAuth設定が不完全です。GITHUB_CLIENT_IDとGITHUB_CLIENT_SECRETの両方が必要です',
          {
            feature: 'environment',
            action: 'oauth_validation',
            provider: 'github',
          }
        );
      }
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private getConfiguredOAuthProviders(): string[] {
    const providers: string[] = [];

    if (this.config.GOOGLE_CLIENT_ID && this.config.GOOGLE_CLIENT_SECRET) {
      providers.push('google');
    }

    if (this.config.GITHUB_CLIENT_ID && this.config.GITHUB_CLIENT_SECRET) {
      providers.push('github');
    }

    return providers;
  }

  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key] as EnvironmentConfig[K];
  }

  public getAll(): EnvironmentConfig {
    return this.config as EnvironmentConfig;
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public hasOAuthProvider(provider: 'google' | 'github'): boolean {
    switch (provider) {
      case 'google':
        return !!(
          this.config.GOOGLE_CLIENT_ID && this.config.GOOGLE_CLIENT_SECRET
        );
      case 'github':
        return !!(
          this.config.GITHUB_CLIENT_ID && this.config.GITHUB_CLIENT_SECRET
        );
      default:
        return false;
    }
  }

  public getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return this.config.LOG_LEVEL || (this.isProduction() ? 'info' : 'debug');
  }
}

// シングルトンインスタンス
export const env = new EnvironmentValidator();

// よく使用される環境変数のショートカット
export const isProduction = env.isProduction();
export const isDevelopment = env.isDevelopment();
export const isTest = env.isTest();
export const logLevel = env.getLogLevel();

// 環境変数チェック用のヘルパー関数
export const checkEnvironment = (): void => {
  try {
    env.getAll();
    logger.info('環境設定チェック完了', {
      feature: 'environment',
      action: 'check',
      environment: env.get('NODE_ENV'),
    });
  } catch (error) {
    logger.error(
      '環境設定エラー',
      {
        feature: 'environment',
        action: 'check',
      },
      error as Error
    );
    throw error;
  }
};
