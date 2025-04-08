package controllers

import (
	"context"
	"camera_manager/internal/httpserver/services"
	"camera_manager/pkg/dtos"
	"camera_manager/pkg/validator"
	"camera_manager/pkg/models"
	"time"
	"github.com/gofiber/fiber/v2"
)


// LoginController godoc
// @Summary User login
// @Description Login a user and return JWT token
// @Tags Auth
// @Accept json
// @Produce json
// @Param dto body dtos.LoginDto true "Login data"
// @Success 200 {object} models.AuthResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /auth/login [post]
func LoginController(c *fiber.Ctx) error {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    dto := &dtos.LoginDto{}

    if err := validator.ValidateDto(c, dto); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": err.Error(),
        })
    }
	var res *models.AuthResponse
    res, err := services.LoginService(ctx, dto) 
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

    return c.Status(fiber.StatusOK).JSON(res)
}



// RefreshController godoc
// @Summary Refresh JWT token
// @Description Refresh access token using refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 201 {object} models.AuthResponse "Access token refreshed successfully"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /auth/refresh [post]
func RefreshController(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var res *models.AuthResponse
	res, err := services.RefreshService(ctx, c) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(res)
}

