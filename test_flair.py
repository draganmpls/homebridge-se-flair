"""Unit tests for Flair API helper functions."""

from unittest.mock import patch, MagicMock
import requests


def get_access_token(client_id: str, client_secret: str) -> str:
    """Retrieve an OAuth access token from the Flair API."""
    res = requests.post(
        "https://api.flair.co/oauth/token",
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        timeout=10,
    )
    res.raise_for_status()
    return res.json()["access_token"]


def fetch_structures(token: str):
    """Return the structures list using the given bearer token."""
    res = requests.get(
        "https://api.flair.co/structures",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    res.raise_for_status()
    return res.json()


def test_api_flow():
    """Verify authentication and structure fetch logic."""
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
            timeout=10,
        )
