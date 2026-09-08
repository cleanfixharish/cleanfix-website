from types import MethodType

import pytest

from schemas.storage import FileUpDownRequest
from services.storage import PRESIGNED_URL_TTL_SECONDS, StorageService


@pytest.mark.asyncio
async def test_presigned_urls_expire_quickly_without_calling_storage():
    service = object.__new__(StorageService)
    captured = []

    async def fake_post(self, endpoint, payload):
        captured.append((endpoint, payload))
        key = "upload_url" if endpoint.endswith("upload_url") else "download_url"
        return {key: "https://storage.invalid/signed", "expires_at": "soon"}

    service._apost_oss_service = MethodType(fake_post, service)
    request = FileUpDownRequest(bucket_name="private-evidence", object_key="proof.jpg")

    await service.create_upload_url(request)
    await service.create_download_url(request)

    assert PRESIGNED_URL_TTL_SECONDS == 300
    assert [payload["expires_in"] for _, payload in captured] == [300, 300]


@pytest.mark.asyncio
async def test_storage_upstream_error_body_is_not_exposed(monkeypatch):
    import httpx

    monkeypatch.setenv("OSS_SERVICE_URL", "https://storage.invalid")
    service = object.__new__(StorageService)
    service.headers = {"Authorization": "Bearer secret", "Content-Type": "application/json"}

    class FakeClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def request(self, **_kwargs):
            request = httpx.Request("GET", "https://storage.invalid/object")
            return httpx.Response(500, request=request, text="private-object-name-and-token")

    monkeypatch.setattr(httpx, "AsyncClient", lambda **_kwargs: FakeClient())

    with pytest.raises(ValueError, match="rejected the request") as error:
        await service._arequest_oss_service("GET", "/object")

    assert "private-object-name" not in str(error.value)
