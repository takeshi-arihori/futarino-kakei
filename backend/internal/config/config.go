package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Database DatabaseConfig `mapstructure:"database"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
}

func LoadConfig() (*Config, error) {
	// config.yaml を読み込む設定
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath(".")

	// .env ファイルを読み込む設定
	viper.SetConfigFile(".env")
	viper.SetConfigType("env") // .env ファイルは env タイプとして読み込む

	// 環境変数を自動的に読み込む
	viper.AutomaticEnv()

	// .envファイルを読み込む (存在しない場合はエラーとしない)
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// .envファイルが見つからない場合はエラーとしない
		} else {
			return nil, err // その他のエラーは返す
		}
	}

	// config.yaml を読み込む (上書きされる)
	viper.SetConfigName("config")                 // config.yaml を再度指定
	viper.SetConfigType("yaml")                   // yaml タイプに戻す
	if err := viper.MergeInConfig(); err != nil { // MergeInConfig を使用して既存の設定にマージ
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// config.yaml が見つからない場合はエラーとしない
		} else {
			return nil, err // その他のエラーは返す
		}
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
