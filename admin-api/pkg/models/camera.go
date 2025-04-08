package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Camera struct {
	Id         primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	IsDisplay  bool               `json:"isDisplay,omitempty" bson:"isDisplay,omitempty"`
	Address    string             `json:"address,omitempty" bson:"address,omitempty"`
	Key        string             `json:"key,omitempty" bson:"key,omitempty"`
	ImgDisplay string             `json:"imgDisplay,omitempty" bson:"imgDisplay,omitempty"`
	Violations []*Violation       `json:"violations,omitempty" bson:"violations,omitempty"`
	UpdatedAt  primitive.DateTime `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
	CreatedAt  primitive.DateTime `json:"created_at,omitempty" bson:"created_at,omitempty"`
}

type Violation struct {
	Id           string `json:"id,omitempty" bson:"id,omitempty"`
	Time         int    `json:"time,omitempty" bson:"time,omitempty"`
	IsDisplay    bool   `json:"isDisplay,omitempty" bson:"isDisplay,omitempty"`
	PlateText    string `json:"plate_text,omitempty" bson:"plate_text,omitempty"`
	VehicleType  string `json:"vehicle_type,omitempty" bson:"vehicle_type,omitempty"`
	VehicleImage string `json:"vehicle_image,omitempty" bson:"vehicle_image,omitempty"`
	PlateImage   string `json:"plate_image,omitempty" bson:"plate_image,omitempty"`
}
