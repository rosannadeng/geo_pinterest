from django import forms
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Profile, Artwork,Comment
from django.conf import settings
import datetime
MAX_UPLOAD_SIZE = 2500000

class LoginForm(forms.Form):

    username = forms.CharField(label='Username', max_length=20)
    password = forms.CharField(label='Password', max_length=20, widget=forms.PasswordInput)

    def login_valid(self):
        if not self.is_valid():
            raise forms.ValidationError("Invalid form data")
        user = authenticate(username=self.cleaned_data['username'], password=self.cleaned_data['password'])
        print(User.objects.filter(username=self.cleaned_data['username']).values())
        if user is not None:
            return user
        else:
            raise forms.ValidationError("Invalid username or password")
    
    def get_user_data(self):
        return User.objects.filter(username=self.cleaned_data['username']).values()[0]
    
class RegisterForm(forms.Form):

    username = forms.CharField(label='Username', max_length=20)
    password = forms.CharField(label='Password', max_length=20, widget=forms.PasswordInput)
    confirm_password = forms.CharField(label='Confirm', max_length=20, widget=forms.PasswordInput)
    firstname = forms.CharField(label='First Name', max_length=20)
    lastname = forms.CharField(label='Last Name', max_length=20)
    email = forms.EmailField(label='E-mail', max_length=50)
    

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("Username already exists")
        return username
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        if not confirm_password:
            raise forms.ValidationError("Please confirm your password")
        if not password:
            raise forms.ValidationError("Please enter a password")
        if password != confirm_password:
            raise forms.ValidationError("Passwords don't match")
        return cleaned_data

    
    def register_user(self):
        if self.is_valid():
            user = User.objects.create_user(
                username=self.cleaned_data['username'],
                password=self.cleaned_data['password'], 
                first_name=self.cleaned_data['firstname'],
                last_name=self.cleaned_data['lastname'],
                email=self.cleaned_data['email'],
            )
            user.save()
            print("User created")
            return user
        raise forms.ValidationError("Invalid form data")
    
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'bio', 'location', 'fname', 'lname']
        labels = {
            'profile_picture': 'Profile Picture',
            'bio': 'About Me',
            'location': 'Location',
            'fname': 'First Name',
            'lname': 'Last Name',
        }
        widgets = {
            'bio': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Tell us about yourself...'
            }),
            'location': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Where are you based?'
            }),
            'fname': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'First Name'
            }),
            'lname': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Last Name'
            }),
            'profile_picture': forms.FileInput(attrs={
                'class': 'form-control'
            })
        }

    def clean_profile_picture(self):
        picture = self.cleaned_data.get('profile_picture')
        if picture:
            if picture.size > settings.MAX_UPLOAD_SIZE:
                raise forms.ValidationError('File size must be under 2.5 MB')
            return picture
        return None

    def save(self, commit=True):
        profile = super().save(commit=False)
        if commit:
            profile.save()
        return profile


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'bio', 'location', 'fname', 'lname']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4}),
        }

class ArtworkForm(forms.ModelForm):
    creation_date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'}),
        help_text='When was this artwork created?'
    )

    class Meta:
        model = Artwork
        fields = ['title', 'description', 'image', 'medium', 'creation_date', 
                 'latitude', 'longitude', 'location_name', 'street_view_url']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'latitude': forms.NumberInput(attrs={'step': 'any'}),
            'longitude': forms.NumberInput(attrs={'step': 'any'}),
        }


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={
                'rows': 3,
                'placeholder': 'Share your thoughts about this artwork...'
            }),
        }

class ArtworkSearchForm(forms.Form):
    SORT_CHOICES = [
        ('recent', 'Most Recent'),
        ('popular', 'Most Popular'),
        ('views', 'Most Viewed'),
    ]

    MEDIUM_CHOICES = [('', 'All')] + list(Artwork.MEDIUM_CHOICES)

    search = forms.CharField(required=False)
    medium = forms.ChoiceField(choices=MEDIUM_CHOICES, required=False)
    sort_by = forms.ChoiceField(choices=SORT_CHOICES, required=False)
    date_from = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    date_to = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))

        