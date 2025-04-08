package routes

import (
	"camera_manager/internal/httpserver/controllers"
	"camera_manager/pkg/middlewares"

	"github.com/gofiber/fiber/v2"
)

func AuthRoutes(a *fiber.App) {
	route := a.Group("/auth")
	route.Post("/signin", controllers.LoginController)
	route.Post("/refresh", middlewares.JwtRefresh(), controllers.RefreshController)
	route.Get("/detail", middlewares.JwtAccess(), controllers.GetUserDetailController)

}
