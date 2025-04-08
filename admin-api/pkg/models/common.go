package models

type DeleteResponse struct {
	Status bool `json:"Status,omitempty"`
}

type TokenResponse struct {
	CameraID string `json:"cameraId"`
	Key      string `json:"key"`
	Server   string `json:"server"`
}
