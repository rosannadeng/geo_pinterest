from django import forms
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile, Artwork


class LoginForm(forms.Form):
    username = forms.CharField(label="Username", max_length=20)
    password = forms.CharField(label="Password", max_length=20, widget=forms.PasswordInput)

    def login_valid(self):
        if not self.is_valid():
            raise forms.ValidationError("Invalid form data")
        user = authenticate(
            username=self.cleaned_data["username"],
            password=self.cleaned_data["password"],
        )
        if user is not None:
            return user
        raise forms.ValidationError("Invalid username or password")


class RegisterForm(forms.Form):
    username = forms.CharField(label="Username", max_length=20)
    password = forms.CharField(label="Password", max_length=20, widget=forms.PasswordInput)
    confirm_password = forms.CharField(label="Confirm Password", max_length=20, widget=forms.PasswordInput)
    firstname = forms.CharField(label="First Name", max_length=20)
    lastname = forms.CharField(label="Last Name", max_length=20)
    email = forms.EmailField(label="Email", max_length=50)

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("Username already exists")
        return username

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email already exists")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords don't match")
        return cleaned_data

    def register_user(self):
        if self.is_valid():
            try:
                user = User.objects.create_user(
                    username=self.cleaned_data["username"],
                    password=self.cleaned_data["password"],
                    first_name=self.cleaned_data["firstname"],
                    last_name=self.cleaned_data["lastname"],
                    email=self.cleaned_data["email"],
                )
                return user
            except Exception as e:
                raise forms.ValidationError(f"Failed to create user: {str(e)}")
        raise forms.ValidationError("Invalid form data")


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ["profile_picture", "bio", "website"]
        widgets = {
            "bio": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                    "placeholder": "Tell us about yourself...",
                }
            ),
            "website": forms.URLInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "https://example.com",
                }
            ),
            "profile_picture": forms.FileInput(attrs={"class": "form-control"}),
        }


class ArtworkForm(forms.ModelForm):
    class Meta:
        model = Artwork
        fields = [
            "title",
            "description",
            "image",
            "medium",
            "creation_date",
            "location_name",
            "latitude",
            "longitude",
        ]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
            "creation_date": forms.DateInput(attrs={"type": "date"}),
        }
