package routes

import (
	"camera_manager/internal/httpserver/controllers"
	"camera_manager/pkg/middlewares"

	"github.com/gofiber/fiber/v2"
)

func ViolationRoutes(a *fiber.App) {
	route := a.Group("/violation")
	route.Post("/create/:id", controllers.CreateViolationController)
	route.Delete("/delete/:cameraId/:id", middlewares.JwtAccess(), controllers.DeleteViolationController)

}
