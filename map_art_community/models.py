from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.FileField(upload_to='avatars/', blank=True, null=True)
    following = models.ManyToManyField(User, related_name='followers')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=30, blank=True)
    fname = models.CharField(max_length=30, blank=True)
    lname = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.user.username}\'s Profile'

class Artwork(models.Model):
    MEDIUM_CHOICES = [
        ('OIL', 'Oil Paint'),
        ('ACR', 'Acrylic'),
        ('WAT', 'Watercolor'),
        ('DIG', 'Digital'),
        ('MIX', 'Mixed Media'),
        ('OTH', 'Other'),
    ]

    artist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='artworks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='artworks/')
    medium = models.CharField(max_length=3, choices=MEDIUM_CHOICES, default='OTH')
    creation_date = models.DateField()
    upload_date = models.DateTimeField(auto_now_add=True)
    
    # Location
    latitude = models.FloatField()
    longitude = models.FloatField()
    location_name = models.CharField(max_length=200)
    street_view_url = models.URLField(blank=True)
    
    # Social 
    likes = models.ManyToManyField(User, related_name='liked_artworks', blank=True)
    views = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-upload_date']

    def __str__(self):
        return self.title

    def total_likes(self):
        return self.likes.count()

class Comment(models.Model):
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author.username} on {self.artwork.title}'

# Signal to create user profile
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
