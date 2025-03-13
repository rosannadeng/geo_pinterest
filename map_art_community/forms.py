from django import forms
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile
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
    photo = forms.ImageField(required=False, widget=forms.FileInput)
    
    class Meta:
        model = Profile
        fields = ['photo', 'about', 'fname', 'lname', 'pronouns', 'location']

    def __init__(self, *args, **kwargs):
        super(Profile, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            if visible.name == 'about':
                visible.field.widget.attrs['class'] = 'edit-profile-input form-control about-input'
            else:
                visible.field.widget.attrs['class'] = 'edit-profile-input form-control rounded-pill'
        