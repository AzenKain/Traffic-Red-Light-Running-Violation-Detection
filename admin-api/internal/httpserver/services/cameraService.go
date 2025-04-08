package services

import (
	"camera_manager/pkg/aes"
	"camera_manager/pkg/cache"
	"camera_manager/pkg/config"
	"camera_manager/pkg/database"
	"camera_manager/pkg/dtos"
	"camera_manager/pkg/models"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var cameraCollection *mongo.Collection = database.GetCollection("cameras")

func CreateCamera(ctx context.Context, dto *dtos.CameraDto) (*models.Camera, error) {
	newCamera := models.Camera{
		Id:         primitive.NewObjectID(),
		UpdatedAt:  primitive.NewDateTimeFromTime(time.Now()),
		CreatedAt:  primitive.NewDateTimeFromTime(time.Now()),
		Address:    dto.Address,
		ImgDisplay: dto.ImgDisplay,
		IsDisplay:  true,
		Violations: []*models.Violation{},
	}

	result, err := cameraCollection.InsertOne(ctx, newCamera)
	if err != nil {
		return nil, err
	}

	var insertedCamera models.Camera
	err = cameraCollection.FindOne(ctx, bson.M{"_id": result.InsertedID}).Decode(&insertedCamera)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error Camera not found")
	}
	toolData, _ := json.Marshal(insertedCamera)
	cache.RI.Set(ctx, fmt.Sprintf("camera:%s", insertedCamera.Id.Hex()), toolData, time.Minute*3)
	return &insertedCamera, nil
}

func GetCameraById(ctx context.Context, Id string) (*models.Camera, error) {
	id, err := primitive.ObjectIDFromHex(Id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Error invalid ID format")
	}
	var camera models.Camera
	keys := fmt.Sprintf("camera:%s", id.Hex())
	value, err := cache.RI.Get(ctx, keys).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(value), &camera); err == nil {
			return &camera, nil
		}
	}
	err = cameraCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&camera)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error camera not found")
	}
	cameraData, _ := json.Marshal(camera)
	cache.RI.Set(ctx, keys, cameraData, time.Minute*3)
	return &camera, nil
}

func UpdateCamera(ctx context.Context, Id string, dto *dtos.CameraDto) (*models.Camera, error) {
	camera, err := GetCameraById(ctx, Id)
	if err != nil {
		return nil, err
	}

	update := bson.M{
		"$set": bson.M{
			"address":    dto.Address,
			"imgDisplay": dto.ImgDisplay,
			"updatedAt":  primitive.NewDateTimeFromTime(time.Now()),
		},
	}

	_, err = cameraCollection.UpdateOne(ctx, bson.M{"_id": camera.Id}, update)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error updating camera")
	}
	camera.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())
	camera.Address = dto.Address
	cameraData, _ := json.Marshal(camera)
	cache.RI.Set(ctx, fmt.Sprintf("camera:%s", camera.Id.Hex()), cameraData, time.Minute*3)
	return camera, nil
}

func DeleteCamera(ctx context.Context, Id string) (*models.DeleteResponse, error) {

	camera, err := GetCameraById(ctx, Id)
	if err != nil {
		return nil, err
	}

	update := bson.M{
		"$set": bson.M{
			"isDisplay": false,
		},
	}

	_, err = cameraCollection.UpdateOne(ctx, bson.M{"_id": camera.Id}, update)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error updating camera")
	}
	cache.RI.Del(ctx, fmt.Sprintf("camera:%s", camera.Id.Hex()))
	return &models.DeleteResponse{Status: true}, nil
}

func CreateKeyForCamera(ctx context.Context, Id string) (string, error) {
	camera, err := GetCameraById(ctx, Id)
	if err != nil {
		return "", err
	}

	key, err := aes.GenerateKey(32)

	if err != nil {
		return "", fiber.NewError(fiber.StatusInternalServerError, "Error generating AES key")
	}
	update := bson.M{
		"$set": bson.M{
			"key":       key,
			"updatedAt": primitive.NewDateTimeFromTime(time.Now()),
		},
	}

	_, err = cameraCollection.UpdateOne(ctx, bson.M{"_id": camera.Id}, update)
	if err != nil {
		return "", fiber.NewError(fiber.StatusInternalServerError, "Error updating camera")
	}
	camera.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())
	camera.Key = key
	cameraData, _ := json.Marshal(camera)
	cache.RI.Set(ctx, fmt.Sprintf("camera:%s", camera.Id.Hex()), cameraData, time.Minute*3)

	serverUrl, _ := config.GetConfig("SERVER_URL")
	response := models.TokenResponse{
		CameraID: camera.Id.Hex(),
		Key:      key,
		Server:   serverUrl,
	}

	responseData, err := json.Marshal(response)
	if err != nil {
		return "", fiber.NewError(fiber.StatusInternalServerError, "Error encoding response")
	}

	base64String := base64.StdEncoding.EncodeToString(responseData)
	return base64String, nil
}

func GetAllCamera(ctx context.Context) ([]*models.Camera, error) {
	var cameras []*models.Camera
	keys := fmt.Sprintf("camera:*")
	value, err := cache.RI.Get(ctx, keys).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(value), &cameras); err == nil {
			return cameras, nil
		}
	}
	cursor, err := cameraCollection.Find(ctx, bson.M{"isDisplay": true})
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error camera not found")
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var camera models.Camera
		if err := cursor.Decode(&camera); err != nil {
			return nil, fiber.NewError(fiber.StatusInternalServerError, "Error camera not found")
		}
		cameras = append(cameras, &camera)
		cameraData, _ := json.Marshal(camera)
		cache.RI.Set(ctx, fmt.Sprintf("camera:%s", camera.Id.Hex()), cameraData, time.Minute*3)
	}
	return cameras, nil
}
