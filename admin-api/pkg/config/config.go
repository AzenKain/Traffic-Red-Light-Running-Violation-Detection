package config

import (
	"errors"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func init() {
	env := os.Getenv("ENV")
	if env != "production" {
		err := godotenv.Load(".env")
		if err != nil {
			log.Println("Warning: .env file not loaded (running outside local environment)")
		}
	}
}

func GetConfig(key string) (string, error) {
	val := os.Getenv(key)
	if val == "" {
		return "", errors.New("config '" + key + "' does not exist")
	}
	return val, nil
}
