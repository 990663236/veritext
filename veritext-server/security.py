# veritext-server/security.py
from passlib.context import CryptContext
import secrets


_pwd = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _pwd.verify(password, hashed)


def new_token() -> str:

    return secrets.token_hex(32)
