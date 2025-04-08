package services

import (
	"context"
	"encoding/json"
	"fmt"
	"camera_manager/pkg/cache"
	"camera_manager/pkg/database"
	"camera_manager/pkg/models"
	"time"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = database.GetCollection("users")

func GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	keys := fmt.Sprintf("users:email:%s", email)
    value, err := cache.RI.Get(ctx, keys).Result()
    if err == nil {
        if err := json.Unmarshal([]byte(value), &user); err == nil {
            return &user, nil
        }
    }
	err = userCollection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
        return nil, fiber.NewError(fiber.StatusInternalServerError, "Error email not found")
	}
	userData, _ := json.Marshal(user)
    cache.RI.Set(ctx, keys, userData, time.Minute * 3)
	return &user, nil
}

func GetUserByUid(ctx context.Context, uid string) (*models.User, error) {
	var user models.User
	keys := fmt.Sprintf("users:uid:%s", uid)
    value, err := cache.RI.Get(ctx, keys).Result()
    if err == nil {
        if err := json.Unmarshal([]byte(value), &user); err == nil {
            return &user, nil
        }
    }
	err = userCollection.FindOne(ctx, bson.M{"uid": uid}).Decode(&user)
	if err != nil {
		return nil, err
	}
	userData, _ := json.Marshal(user)
    cache.RI.Set(ctx, keys, userData, time.Minute * 3)
	return &user, nil
}

func GetUserById(ctx context.Context, Id string) (*models.User, error) {
	var user models.User
	keys := fmt.Sprintf("users:id:%s", Id)
    value, err := cache.RI.Get(ctx, keys).Result()
    if err == nil {
        if err := json.Unmarshal([]byte(value), &user); err == nil {
            return &user, nil
        }
    }
	userId, err := primitive.ObjectIDFromHex(Id)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Error invalid ID format")
	}

	err = userCollection.FindOne(ctx, bson.M{"_id": userId}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fiber.NewError(fiber.StatusNotFound, "User not found")
		}
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error user id not found")
	}
	userData, _ := json.Marshal(user)
    cache.RI.Set(ctx, keys, userData, time.Minute * 3)
	return &user, nil
}