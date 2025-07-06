from datetime import timedelta, datetime

import pytest

from backend.app.auth import create_access_token, decode_access_token


def test_create_and_decode_token():
    subject = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(subject, expires_delta=timedelta(minutes=5))
    assert isinstance(token, str)

    decoded_sub = decode_access_token(token)
    assert decoded_sub == subject


def test_token_expiry():
    subject = "abc"
    token = create_access_token(subject, expires_delta=timedelta(seconds=-1))

    # wait tiny bit to ensure expiry (no sleep needed; exp is already past)
    decoded = decode_access_token(token)
    assert decoded is None, "Expired token should return None" 