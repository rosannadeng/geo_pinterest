from social_core.pipeline.user import create_user
from .models import Profile

def create_profile(backend, user, response, *args, **kwargs):
    """Create a profile for the user if it doesn't exist"""
    if not hasattr(user, 'profile'):
        Profile.objects.create(user=user)
        return {'is_new': True}
    return {'is_new': False} 