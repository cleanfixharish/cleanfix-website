import base64
import hashlib

from cryptography.fernet import Fernet

from core.config import settings


class PilotIdentityCryptoError(RuntimeError):
    pass


def encrypt_company_registration_id(value: str) -> str:
    secret = settings.pilot_identity_encryption_key.strip()
    if len(secret) < 32:
        raise PilotIdentityCryptoError("Pilot identity encryption is not configured")
    key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode("utf-8")).digest())
    return Fernet(key).encrypt(value.encode("utf-8")).decode("ascii")
