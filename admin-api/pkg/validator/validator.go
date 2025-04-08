package validator

import (
	"camera_manager/pkg/models"
	"errors"
	"fmt"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()

func ValidateDto(c *fiber.Ctx, s interface{}) error {

	if err := c.BodyParser(s); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	if err := validate.Struct(s); err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errorMessages := make(map[string]string)

		for _, fieldError := range validationErrors {
			errorMessages[fieldError.Field()] = fieldError.Tag() + " validation failed"
		}

		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+validationErrors.Error())
	}

	return nil
}


func ValidateQueryDto(c *fiber.Ctx, dto interface{}) error {
	if err := c.QueryParser(dto); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid query parameters: "+err.Error())
	}

	if err := validate.Struct(dto); err != nil {
		var validationErrors validator.ValidationErrors
		if errors.As(err, &validationErrors) {
			errorMessages := make(map[string]string)
			for _, fieldError := range validationErrors {
				errorMessages[fieldError.Field()] = fmt.Sprintf("failed '%s' validation", fieldError.Tag())
			}
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": errorMessages})
		}
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	return nil
}

func ValidateUser(c *fiber.Ctx) (*models.User, error) {
	userData := c.Locals("user")
	if userData == nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "User not found")
	}
	user, ok := userData.(*models.User)
	if !ok {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "User not convert")
	}
	return user, nil
}
