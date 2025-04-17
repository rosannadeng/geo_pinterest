from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="profile_pictures/", null=True, blank=True)
    website = models.URLField(max_length=200, blank=True)
    featured_artworks = models.ManyToManyField(Artwork, related_name="featured_in_profiles", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class Artwork(models.Model):
    MEDIUM_CHOICES = [
        ("OIL", "Oil Paint"),
        ("ACR", "Acrylic"),
        ("WAT", "Watercolor"),
        ("DIG", "Digital"),
        ("MIX", "Mixed Media"),
        ("OTH", "Other"),
    ]

    artist = models.ForeignKey(User, on_delete=models.CASCADE, related_name="artworks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="artworks/")
    medium = models.CharField(max_length=3, choices=MEDIUM_CHOICES, default="OTH")
    creation_date = models.DateField()
    upload_date = models.DateTimeField(auto_now_add=True)
    location_name = models.CharField(max_length=200)
    latitude = models.FloatField(validators=[MinValueValidator(-90), MaxValueValidator(90)], null=True, blank=True)
    longitude = models.FloatField(validators=[MinValueValidator(-180), MaxValueValidator(180)], null=True, blank=True)
    likes = models.ManyToManyField(User, related_name="liked_artworks", blank=True)
    views = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

    def total_likes(self):
        return self.likes.count()


class Comment(models.Model):
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.artwork.title}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
