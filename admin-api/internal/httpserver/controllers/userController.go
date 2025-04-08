package controllers

import (
	"camera_manager/pkg/validator"
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetUserDetailController(c *fiber.Ctx) error {
	_, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	user, err := validator.ValidateUser(c) 

    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

	return c.Status(fiber.StatusOK).JSON(user)
}
