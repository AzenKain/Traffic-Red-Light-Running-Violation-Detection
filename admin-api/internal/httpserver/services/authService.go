package services

import (
	"camera_manager/pkg/dtos"
	"camera_manager/pkg/models"
	"context"
	"errors"
	"os"
	"time"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func VerifyJWT(tokenString, typeJwt string) (*models.CustomClaims, error) {

	err := godotenv.Load(".env")
	if err != nil {
		return nil, err
	}

	jwtSecret := os.Getenv(typeJwt)

	if jwtSecret == "" {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "missing JWT_SECRET in environment")
	}

	token, err := jwt.ParseWithClaims(tokenString, &models.CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.NewError(fiber.StatusUnauthorized, "unexpected signing method!")
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*models.CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func GenToken(Id primitive.ObjectID, Email string) (*models.AuthResponse, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return nil, err
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	jwtRefreshSecret := os.Getenv("JWT_REFRESH_SECRET")

	if jwtSecret == "" || jwtRefreshSecret == "" {
		return nil, errors.New("missing JWT secrets in environment")
	}

	claimsAccess := jwt.MapClaims{
		"Id":    Id,
		"Email": Email,
		"exp":   time.Now().Add(6 * time.Hour).Unix(),
	}

	claimsRefresh := jwt.MapClaims{
		"Id":    Id,
		"Email": Email,
		"exp":   time.Now().Add(15 * 24 * time.Hour).Unix(),
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claimsAccess)
	at, err := accessToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return nil, err
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claimsRefresh)
	rt, err := refreshToken.SignedString([]byte(jwtRefreshSecret))
	if err != nil {
		return nil, err
	}

	res := models.AuthResponse{
		AccessToken:  at,
		RefreshToken: rt,
	}
	return &res, nil
}

func SaveNewRefreshToken(ctx context.Context, Id primitive.ObjectID, RefreshToken string) error {
	var user models.User
	err := userCollection.FindOne(ctx, bson.M{"_id": Id}).Decode(&user)
	if err != nil {
		return err
	}
	user.RefreshToken = RefreshToken

	_, err = userCollection.UpdateOne(
		ctx,
		bson.M{"_id": Id},
		bson.M{"$set": bson.M{"refresh_token": RefreshToken}},
	)
	if err != nil {
		return err
	}

	return nil
}

func LoginService(ctx context.Context, dto *dtos.LoginDto) (*models.AuthResponse, error) {

	user, err := GetUserByEmail(ctx, dto.Email)

	if user == nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "User doesn't exists!"+err.Error())
	}

	if !CheckPasswordHash(dto.Password, user.Hash) {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid identity or password!")

	}

	data, err := GenToken(user.Id, user.Email)

	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "")

	}

	err = SaveNewRefreshToken(ctx, user.Id, data.RefreshToken)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to save refresh token")
	}

	return data, nil
}


func SignUpService(ctx context.Context, dto *dtos.SignUpDto) (*models.AuthResponse, error) {
	_, err := GetUserByEmail(ctx, dto.Email)

	if err == nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "User already exists!")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)

	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	newUser := models.User{
		Id:           primitive.NewObjectID(),
		Username:     dto.Username,
		Email:        dto.Email,
		IsDisplay:    true,
		RefreshToken: "",
		Role:         []string{"user"},
		Hash:         string(hashedPassword),
		UpdatedAt:  primitive.NewDateTimeFromTime(time.Now()),
		CreatedAt:  primitive.NewDateTimeFromTime(time.Now()),
	}

	result, err := userCollection.InsertOne(ctx, newUser)
	if err != nil {
		return nil, err
	}

	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": result.InsertedID}).Decode(&user)
	if err != nil {
		return nil, err
	}
	data, err := GenToken(user.Id, user.Email)

	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error can't gen token")

	}

	err = SaveNewRefreshToken(ctx, user.Id, data.RefreshToken)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to save refresh token")
	}

	return data, nil

}

func RefreshService(ctx context.Context, c *fiber.Ctx) (*models.AuthResponse, error) {
	userData := c.Locals("user")
	if userData == nil {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "User not found")
	}

	user, ok := userData.(*models.User)
	if !ok {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Invalid user data")
	}

	data, err := GenToken(user.Id, user.Email)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to generate new token")
	}

	err = SaveNewRefreshToken(ctx, user.Id, data.RefreshToken)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Failed to save refresh token")
	}

	return data, nil
}
