package cache

import (
    "context"
	"camera_manager/pkg/config"
	"camera_manager/pkg/log"
    "github.com/redis/go-redis/v9"
)

var RI *redis.Client

func Connect() {
	connectionURI, _ := config.GetConfig("REDIS_CONNECTION_URI")

	if connectionURI == ""  {
		log.Logger.Error("Missing MongoDB configuration in environment variables")
	}

    rdb := redis.NewClient(&redis.Options{
        Addr:     connectionURI,
        Password: "",
        DB:       0, 
    })

    if err := rdb.Ping(context.Background()).Err(); err != nil {
        log.Logger.Errorf("Could not connect to Redis: %v\n", err)
        return
    }

    RI = rdb
    log.Logger.Info("Connect to Redis successfully!")
}

func init() {
    Connect()
}
