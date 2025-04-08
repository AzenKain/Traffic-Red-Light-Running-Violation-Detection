package database

import (
	"camera_manager/pkg/config"
	"camera_manager/pkg/log"
	"camera_manager/pkg/models"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"golang.org/x/crypto/bcrypt"
)

type MongoInstance struct {
	Client *mongo.Client
	DB     *mongo.Database
}

var MI MongoInstance

func Connect() {
	connectionURI, _ := config.GetConfig("MONGO_CONNECTION_URI")
	database, _ := config.GetConfig("MONGO_DATABASE")

	if connectionURI == "" || database == "" {
		log.Logger.Error("Missing MongoDB configuration in environment variables")
	}

	clientOptions := options.Client().ApplyURI(connectionURI)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Logger.Error(err)
	}

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Logger.Error(err)
	}

	log.Logger.Info("Connect to MongoDB successfully!")

	MI = MongoInstance{
		Client: client,
		DB:     client.Database(database),
	}

	ensureDefaultAdmin(ctx)
}

func ensureDefaultAdmin(ctx context.Context) {
	userCol := MI.DB.Collection("users")

	var admin models.User
	err := userCol.FindOne(ctx, bson.M{"role": bson.M{"$in": []string{"admin"}}}).Decode(&admin)
	if err == mongo.ErrNoDocuments {
		hashedPwd := hashPassword("admin123")

		now := primitive.NewDateTimeFromTime(time.Now())

		newUser := models.User{
			Id:        primitive.NewObjectID(),
			Username:  "admin",
			Email:     "admin@admin.com",
			Hash:      hashedPwd,
			Role:      []string{"admin"},
			IsDisplay: true,
			CreatedAt: now,
			UpdatedAt: now,
		}

		_, err := userCol.InsertOne(ctx, newUser)
		if err != nil {
			log.Logger.Error("Failed to create default admin:", err)
			return
		}
		log.Logger.Info("Default admin created: admin@admin.com / admin123")
	} else if err != nil {
		log.Logger.Error("Error checking admin user:", err)
	} else {
		log.Logger.Info("Admin user already exists")
	}
}

func hashPassword(password string) string {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash)
}

func GetCollection(collectionName string) *mongo.Collection {
	if MI.DB == nil {
		log.Logger.Error("No MongoDB database is connected")
		return nil
	}
	return MI.DB.Collection(collectionName)
}

func init() {
	Connect()
}
