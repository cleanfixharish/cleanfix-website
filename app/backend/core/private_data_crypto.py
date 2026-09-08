import base64
import hashlib
import json

from cryptography.fernet import Fernet, InvalidToken

from core.config import settings


class PrivateDataCryptoError(RuntimeError):
    pass


def _fernet() -> Fernet:
    secret = settings.service_location_encryption_key.strip()
    if len(secret) < 32:
        raise PrivateDataCryptoError("Private service-location encryption is not configured")
    derived = base64.urlsafe_b64encode(hashlib.sha256(secret.encode("utf-8")).digest())
    return Fernet(derived)


def encrypt_private_payload(payload: dict[str, str | None]) -> str:
    serialized = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return _fernet().encrypt(serialized.encode("utf-8")).decode("ascii")


def decrypt_private_payload(ciphertext: str) -> dict[str, str | None]:
    try:
        raw = _fernet().decrypt(ciphertext.encode("ascii"))
        payload = json.loads(raw.decode("utf-8"))
    except (InvalidToken, UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        raise PrivateDataCryptoError("Private service-location data cannot be decrypted") from exc
    if (
        not isinstance(payload, dict)
        or not isinstance(payload.get("exact_address"), str)
        or not payload["exact_address"].strip()
        or payload.get("access_instructions") is not None
        and not isinstance(payload.get("access_instructions"), str)
    ):
        raise PrivateDataCryptoError("Private service-location data is invalid")
    return {
        "exact_address": payload["exact_address"],
        "access_instructions": payload.get("access_instructions"),
    }
