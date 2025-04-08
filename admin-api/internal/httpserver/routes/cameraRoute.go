package routes

import (
	"camera_manager/internal/httpserver/controllers"
	"camera_manager/pkg/middlewares"

	"github.com/gofiber/fiber/v2"
)

func CameraRoutes(a *fiber.App) {
	route := a.Group("/camera")
	route.Post("/create", middlewares.JwtAccess(), controllers.CreateCameraController)
	route.Put("/update/:id", middlewares.JwtAccess(), controllers.UpdateCameraController)
	route.Delete("/delete/:id", middlewares.JwtAccess(), controllers.DeleteCameraController)
	route.Put("/key/:id", middlewares.JwtAccess(), controllers.CreateKeyForCamera)
	route.Get("/all", middlewares.JwtAccess(), controllers.GetAllCameraController)
	route.Get("/id/:id", middlewares.JwtAccess(), controllers.GetCameraByIdController)
}
