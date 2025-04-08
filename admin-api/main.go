package main

import (
	"camera_manager/internal/httpserver/routes"
	"camera_manager/pkg/config"
	"camera_manager/pkg/log"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())
	routes.AuthRoutes(app)
	routes.CameraRoutes(app)
	routes.ViolationRoutes(app)
	routes.NotFoundRoute(app)

	port, _ := config.GetConfig("PORT")
	if port == "" {
		port = "3000"
		log.Logger.Warn("No PORT specified, defaulting to 3000")
	}

	if err := app.Listen(":" + port); err != nil {
		log.Logger.Errorf("Error: app failed to start on port %s, %v", port, err)
		panic(err)
	}

}
