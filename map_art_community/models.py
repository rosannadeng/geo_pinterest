from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.FileField(blank=True, null=True)
    following = models.ManyToManyField(User, related_name='followers')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=30, blank=True)
    fname = models.CharField(max_length=30, blank=True)
    lname = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_set')
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_set')

    def __str__(self):
        return f'{self.follower.username} follows {self.followed.username}'
