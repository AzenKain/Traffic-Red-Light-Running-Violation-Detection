package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	Id           primitive.ObjectID  `json:"_id,omitempty" bson:"_id,omitempty"`
	Username     string              `json:"username,omitempty" bson:"username,omitempty"`
	IsDisplay    bool                `json:"isDisplay,omitempty" bson:"isDisplay,omitempty"`
	Birthday     *primitive.DateTime `json:"birthday,omitempty" bson:"birthday,omitempty"`
	Email        string              `json:"email,omitempty" bson:"email,omitempty"`
	Gender       int                 `json:"gender,omitempty" bson:"gender,omitempty"`
	Hash         string              `json:"hash,omitempty" bson:"hash,omitempty"`
	Role         []string            `json:"role,omitempty" bson:"role,omitempty"`
	RefreshToken string              `json:"refresh_token,omitempty" bson:"refresh_token,omitempty"`
	UpdatedAt    primitive.DateTime  `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
	CreatedAt    primitive.DateTime  `json:"created_at,omitempty" bson:"created_at,omitempty"`
}
