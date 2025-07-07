import base64, uuid, pytest

@pytest.mark.asyncio
async def test_vault_crud(client, db_session):
    # register & login to obtain token
    email = f"vault{uuid.uuid4()}@ex.com"
    pw = "Secret123!"
    payload = {"email": email, "password": pw}
    r = await client.post("/api/auth/register", json=payload)
    assert r.status_code == 201
    r = await client.post("/api/auth/login", json=payload)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # post vault
    raw = b"myencryptedbytes"
    blob = base64.b64encode(raw).decode()
    r = await client.post("/api/vault", json={"blob": blob, "version": 1}, headers=headers)
    assert r.status_code == 201
    assert r.json()["blob"] == blob

    # get latest vault
    r = await client.get("/api/vault", headers=headers)
    assert r.status_code == 200
    assert r.json()["blob"] == blob 