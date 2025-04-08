package models

import "github.com/golang-jwt/jwt/v5"

type AuthResponse struct {
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type CustomClaims struct {
	Id    string `json:"Id"`
	Email string `json:"Email"`
	jwt.RegisteredClaims
}