package controllers

import (
	"context"
	"camera_manager/internal/httpserver/services"
	"camera_manager/pkg/dtos"
	"camera_manager/pkg/validator"
	"time"
	"github.com/gofiber/fiber/v2"
)


func CreateViolationController(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dto := &dtos.ViolationDto{}

	if err := validator.ValidateDto(c, dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	Id := c.Params("id")

	res, err := services.AddViolation(ctx, dto, Id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(res)
}

func DeleteViolationController(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	CameraId := c.Params("cameraId")
	Id := c.Params("id")

	res, err := services.DeleteViolation(ctx, Id, CameraId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}