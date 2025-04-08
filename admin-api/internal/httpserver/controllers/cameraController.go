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

func CreateCameraController(c *fiber.Ctx) error {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    dto := &dtos.CameraDto{}

    if err := validator.ValidateDto(c, dto); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

	var res *models.Camera
    res, err := services.CreateCamera(ctx, dto) 
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

    return c.Status(fiber.StatusCreated).JSON(res)
}

func UpdateCameraController(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dto := &dtos.CameraDto{}

	if err := validator.ValidateDto(c, dto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	Id := c.Params("id")
	var res *models.Camera
	res, err := services.UpdateCamera(ctx, Id, dto) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func DeleteCameraController(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	Id := c.Params("id")
	resp, err := services.DeleteCamera(ctx, Id) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(resp)
}

func CreateKeyForCamera(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	Id := c.Params("id")
	res, err := services.CreateKeyForCamera(ctx, Id) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"key": res, 
	})
}

func GetAllCameraController(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	res, err := services.GetAllCamera(ctx) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}

func GetCameraByIdController(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	Id := c.Params("id")
	var res *models.Camera
	res, err := services.GetCameraById(ctx, Id) 
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(res)
}