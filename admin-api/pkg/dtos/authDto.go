package dtos

type SignUpDto struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
	Username string `json:"username" validate:"required"`
}

type LoginDto struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

