from social_django.models import UserSocialAuth
from .models import Profile


def create_profile(backend, user, response, *args, **kwargs):
    """Create a profile for the user if it doesn't exist"""
    if not hasattr(user, "profile"):
        Profile.objects.create(user=user)
        return {"is_new": True}
    return {"is_new": False}


import requests


def save_email_to_extra_data(strategy, details, response, user=None, social=None, *args, **kwargs):
    access_token = response.get("access_token")
    if not access_token:
        return

    userinfo_response = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        params={"access_token": access_token},
    )

    if userinfo_response.status_code != 200:
        return

    userinfo = userinfo_response.json()

    if social:
        social_auths = UserSocialAuth.objects.filter(user=user, provider="google-oauth2")
        for social_auth in social_auths:
            social_auth.extra_data["email"] = userinfo.get("email")
            social_auth.extra_data["fullname"] = userinfo.get("name")
            social_auth.extra_data["picture"] = userinfo.get("picture")
            social_auth.save()

    return {
        "email": userinfo.get("email"),
        "fullname": userinfo.get("name"),
        "picture": userinfo.get("picture"),
    }
