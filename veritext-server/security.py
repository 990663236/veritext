# veritext-server/security.py
from passlib.context import CryptContext
import secrets

# Usa bcrypt_sha256 para evitar el límite de 72 bytes
_pwd = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _pwd.verify(password, hashed)


def new_token() -> str:
    # 32 bytes -> 64 caracteres hexadecimales, cabe de sobra en VARCHAR(128)
    return secrets.token_hex(32)
