from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from .models import Profile, Artwork
from datetime import date
import os

class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )

    def test_login(self):
        response = self.client.post(reverse('login'), {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('home'))

    def test_register(self):
        response = self.client.post(reverse('register'), {
            'username': 'newuser',
            'password': 'newpass123',
            'confirm_password': 'newpass123',
            'firstname': 'New',
            'lastname': 'User',
            'email': 'new@example.com'
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.filter(username='newuser').exists())

class ProfileTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com',
            first_name='Test',
            last_name='User'
        )
        self.profile = Profile.objects.get(user=self.user)

    def test_profile_creation(self):
        """Test that profile is created automatically when user is created"""
        self.assertIsNotNone(self.profile)
        self.assertEqual(self.profile.user, self.user)

    def test_profile_str(self):
        """Test the string representation of Profile"""
        self.assertEqual(str(self.profile), "testuser's profile")

    def test_profile_update(self):
        """Test updating profile information"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.post(reverse('profile_setup'), {
            'bio': 'Test bio',
            'location': 'Test location'
        })
        self.assertEqual(response.status_code, 302)  
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.bio, 'Test bio')
        self.assertEqual(self.profile.location, 'Test location')

    def test_profile_display(self):
        """Test that profile page displays correct information"""
        self.client.login(username='testuser', password='testpass123')
        
        
        self.profile.bio = 'Test bio'
        self.profile.location = 'Test location'
        self.profile.save()

        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test bio')
        self.assertContains(response, 'Test location')
        self.assertContains(response, 'Test User') 

class ArtworkTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.login(username='testuser', password='testpass123')
        
        # Create test image using your actual image
        image_path = os.path.join('map_art_community', 'static', 'map_art_community', 'images', 'default_profile_picture.jpg')
        with open(image_path, 'rb') as img:
            self.test_image = SimpleUploadedFile(
                name='default_profile_picture.jpg',
                content=img.read(),
                content_type='image/jpeg'
            )

    def test_artwork_creation(self):
        """Test creating a new artwork"""
        response = self.client.post(reverse('artwork_create'), {
            'title': 'Test Artwork',
            'description': 'Test Description',
            'image': self.test_image,
            'medium': 'OIL',
            'creation_date': date.today(),
            'location_name': 'Test Location'
        })
        self.assertEqual(response.status_code, 302)  # Should redirect after successful creation
        self.assertTrue(Artwork.objects.filter(title='Test Artwork').exists())

    def test_artwork_update(self):
        """Test updating an existing artwork"""
        artwork = Artwork.objects.create(
            artist=self.user,
            title='Original Title',
            description='Original Description',
            image=self.test_image,
            medium='OIL',
            creation_date=date.today(),
            location_name='Original Location'
        )
        
        response = self.client.post(
            reverse('artwork_update', kwargs={'pk': artwork.pk}),
            {
                'title': 'Updated Title',
                'description': 'Updated Description',
                'medium': 'WAT',
                'creation_date': date.today(),
                'location_name': 'Updated Location'
            }
        )
        
        self.assertEqual(response.status_code, 302)  
        
        artwork.refresh_from_db()
        self.assertEqual(artwork.title, 'Updated Title')
        self.assertEqual(artwork.description, 'Updated Description')
        self.assertEqual(artwork.location_name, 'Updated Location')
