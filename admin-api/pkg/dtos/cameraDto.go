package dtos

type CameraDto struct {
	Address    string `json:"address" validate:"required"`
	ImgDisplay string `json:"imgDisplay"`
}

type ViolationDto struct {
	Data string `json:"data,omitempty" validate:"required"`
}

type ViolationDtoDecrypted struct {
	Time         int    `json:"time,omitempty" validate:"required"`
	PlateText    string `json:"plate_text,omitempty" validate:"required"`
	VehicleType  string `json:"vehicle_type,omitempty" validate:"required"`
	VehicleImage string `json:"vehicle_image,omitempty" validate:"required"`
	PlateImage   string `json:"plate_image,omitempty" validate:"required"`
}
