package aes

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

type AESCrypt struct {
	key []byte
}

func NewAESCryptFromKey(key string) (*AESCrypt, error) {
	k, err := decodeBase64ToBytes(key)
	if err != nil {
		return nil, err

	}
	if len(k) != 16 && len(k) != 24 && len(k) != 32 {
		return nil, errors.New("AES key must be 16, 24, or 32 bytes")
	}
	return &AESCrypt{key: k}, nil
}

func GenerateKey(length int) (string, error) {
	if length != 16 && length != 24 && length != 32 {
		return "", errors.New("key length must be 16, 24, or 32 bytes")
	}
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}
func decodeBase64ToBytes(base64Str string) ([]byte, error) {
	decodedBytes, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		return nil, err
	}
	return decodedBytes, nil
}
func (a *AESCrypt) Encrypt(plainText string) (string, error) {
	block, err := aes.NewCipher(a.key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	cipherText := aesGCM.Seal(nonce, nonce, []byte(plainText), nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

func (a *AESCrypt) Decrypt(encrypted string) ([]byte, error) {
	cipherText, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(a.key)
	if err != nil {
		return nil, err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := aesGCM.NonceSize()
	if len(cipherText) < nonceSize {
		return nil, errors.New("invalid ciphertext")
	}

	nonce, cipherText := cipherText[:nonceSize], cipherText[nonceSize:]
	plainText, err := aesGCM.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return nil, err
	}

	return plainText, nil
}
