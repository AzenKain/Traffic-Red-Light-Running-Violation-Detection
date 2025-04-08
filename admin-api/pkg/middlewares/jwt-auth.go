package middlewares

import (
	"context"
	"camera_manager/internal/httpserver/services"
	"camera_manager/pkg/config"
	"time"
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JwtAccess() fiber.Handler {

	jwtSecret, _ := config.GetConfig("JWT_SECRET")
	if jwtSecret == "" {
		return nil
	}

	return jwtware.New(jwtware.Config{
		SigningKey:     jwtware.SigningKey{Key: []byte(jwtSecret)},
		ErrorHandler:   jwtError,
		SuccessHandler: jwtSuccess,
	})
}

func JwtRefresh() fiber.Handler {
	jwtRefreshSecret, _ := config.GetConfig("JWT_REFRESH_SECRET")
	if jwtRefreshSecret == "" {
		return nil
	}

	return jwtware.New(jwtware.Config{
		SigningKey:     jwtware.SigningKey{Key: []byte(jwtRefreshSecret)},
		ErrorHandler:   jwtError,
		SuccessHandler: jwtSuccess,
	})
}


func jwtSuccess(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)

	idStr, ok := claims["Id"].(string)
	if !ok {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid ID format")
	}

	userData, err := services.GetUserById(ctx, idStr)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Cannot fetch user data",
			"data":    nil,
		})
	}

	c.Locals("user", userData)

	return c.Next()
}

func jwtError(c *fiber.Ctx, err error) error {
	if err.Error() == "Missing or malformed JWT" {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"status": "error", "message": "Missing or malformed JWT", "data": nil})
	}
	return c.Status(fiber.StatusUnauthorized).
		JSON(fiber.Map{"status": "error", "message": "Invalid or expired JWT", "data": nil})
}

