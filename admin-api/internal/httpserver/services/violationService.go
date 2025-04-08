package services

import (
	"camera_manager/pkg/cache"
	"camera_manager/pkg/dtos"
	"camera_manager/pkg/models"
	"camera_manager/pkg/aes"
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddViolation(ctx context.Context, req *dtos.ViolationDto, CameraId string) (*models.Camera, error) {
	camera, err := GetCameraById(ctx, CameraId)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Camera not found")
	}
	AES, err := aes.NewAESCryptFromKey(camera.Key)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error creating AES instance")
	}

	dtoBytes, err := AES.Decrypt(req.Data)

	var dto dtos.ViolationDtoDecrypted
	err = json.Unmarshal(dtoBytes, &dto)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Invalid violation data format")
	}
	
	newViolation := models.Violation{
		Id:           uuid.New().String(),
		Time:         dto.Time,
		IsDisplay:    true,
		PlateText:    dto.PlateText,
		VehicleType:  dto.VehicleType,
		PlateImage:   dto.PlateImage,
		VehicleImage: dto.VehicleImage,
	}

	camera.Violations = append(camera.Violations, &newViolation)

	update := bson.M{
		"$set": bson.M{
			"violations": camera.Violations,
			"updatedAt":  primitive.NewDateTimeFromTime(time.Now()),
		},
	}

	_, err = cameraCollection.UpdateOne(ctx, bson.M{"_id": camera.Id}, update)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error updating camera")
	}
	camera.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	cameraData, _ := json.Marshal(camera)
	cache.RI.Set(ctx, fmt.Sprintf("camera:%s", camera.Id.Hex()), cameraData, time.Minute*3)
	return camera, nil
}

func DeleteViolation(ctx context.Context, ViolationId string, CameraId string) (*models.Camera, error) {

	camera, err := GetCameraById(ctx, CameraId)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusNotFound, "Camera not found")
	}

	found := false
	for _, violation := range camera.Violations {
		if violation.Id == ViolationId {
			violation.IsDisplay = false
			found = true
			break
		}
	}
	if !found {
		return nil, fiber.NewError(fiber.StatusNotFound, "Violation not found")
	}

	update := bson.M{
		"$set": bson.M{
			"violations": camera.Violations,
			"updatedAt":  primitive.NewDateTimeFromTime(time.Now()),
		},
	}

	_, err = cameraCollection.UpdateOne(ctx, bson.M{"_id": camera.Id}, update)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error updating camera")
	}
	camera.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	cameraData, _ := json.Marshal(camera)
	cache.RI.Set(ctx, fmt.Sprintf("camera:%s", camera.Id.Hex()), cameraData, time.Minute*3)
	return camera, nil
}
