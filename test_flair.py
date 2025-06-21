import requests
from unittest.mock import patch, MagicMock


def get_access_token(client_id: str, client_secret: str) -> str:
    res = requests.post(
        "https://api.flair.co/oauth/token",
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
    )
    res.raise_for_status()
    return res.json()["access_token"]


def fetch_structures(token: str):
    res = requests.get(
        "https://api.flair.co/structures",
        headers={"Authorization": f"Bearer {token}"},
    )
    res.raise_for_status()
    return res.json()


def test_api_flow():
    token_resp = MagicMock(status_code=200, json=lambda: {"access_token": "T"})
    structures_resp = MagicMock(status_code=200, json=lambda: {"data": []})
    with patch("requests.post", return_value=token_resp) as mock_post, patch(
        "requests.get", return_value=structures_resp
    ) as mock_get:
        token = get_access_token("id", "secret")
        assert token == "T"
        data = fetch_structures(token)
        assert data == {"data": []}
        mock_post.assert_called_once()
        mock_get.assert_called_once_with(
            "https://api.flair.co/structures",
            headers={"Authorization": "Bearer T"},
        )
