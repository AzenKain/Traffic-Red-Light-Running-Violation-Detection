import base64
import json
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import sys

def decode_base64_to_dict(b64_str: str) -> dict:
    decoded_bytes = base64.b64decode(b64_str)
    decoded_str = decoded_bytes.decode('utf-8')
    return json.loads(decoded_str)


class AESCrypt:
    def __init__(self, key):
        self.key = base64.b64decode(key)
        if len(self.key) not in [16, 24, 32]:
            raise ValueError("AES key must be 16, 24, or 32 bytes")
        
    @staticmethod
    def generate_key(length=32):
        if length not in [16, 24, 32]:
            raise ValueError("Key length must be 16, 24, or 32 bytes")
        key = get_random_bytes(length)
        return base64.b64encode(key).decode('utf-8')

    def encrypt(self, plaintext):
        # Create AES cipher with GCM mode
        nonce = get_random_bytes(12)
        cipher = AES.new(self.key, AES.MODE_GCM, nonce=nonce)
        
        # Encrypt the plaintext
        ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())
        
        # Return base64 encoded nonce + ciphertext + tag
        return base64.b64encode(nonce + ciphertext + tag).decode('utf-8')

    def decrypt(self, encrypted):
        data = base64.b64decode(encrypted)
        
        nonce = data[:12]
        ciphertext = data[12:-16]
        tag = data[-16:]
        
        cipher = AES.new(self.key, AES.MODE_GCM, nonce=nonce)
        
        # Decrypt the data
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        return plaintext.decode('utf-8')