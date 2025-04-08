from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
<<<<<<< HEAD
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="profile_pictures/", null=True, blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
=======
    profile_picture = models.ImageField(upload_to="profile_pictures/", null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
>>>>>>> 74c7bee74034f83c085238b347095160ea532df2
    featured_artwork = models.ForeignKey(
        "Artwork",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_profiles",
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"


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
<<<<<<< HEAD
    latitude = models.FloatField(validators=[MinValueValidator(-90), MaxValueValidator(90)], null=True, blank=True)
    longitude = models.FloatField(validators=[MinValueValidator(-180), MaxValueValidator(180)], null=True, blank=True)
=======
    latitude = models.FloatField(validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.FloatField(validators=[MinValueValidator(-180), MaxValueValidator(180)])
>>>>>>> 74c7bee74034f83c085238b347095160ea532df2
    likes = models.ManyToManyField(User, related_name="liked_artworks", blank=True)
    views = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

    def total_likes(self):
        return self.likes.count()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
