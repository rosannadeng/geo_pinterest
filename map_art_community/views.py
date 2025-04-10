from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import DetailView, CreateView, UpdateView, ListView
from django.contrib import messages
from django.http import Http404, HttpResponse, JsonResponse
from django.urls import reverse_lazy
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from .models import Profile, Artwork
import mimetypes
import json
from .forms import LoginForm, RegisterForm, ProfileForm, ArtworkForm
from social_core.exceptions import AuthFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework import serializers
import os
from django.views.decorators.csrf import csrf_exempt
import requests
from django.conf import settings
from PIL import Image
from datetime import datetime
import tempfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = ["user", "bio", "profile_picture", "website"]


class ArtworkSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(required=False, write_only=True)
    artist = serializers.PrimaryKeyRelatedField(read_only=True)
    total_likes = serializers.SerializerMethodField()

    class Meta:
        model = Artwork
        fields = [
            "id",
            "title",
            "description",
            "image",
            "image_url",
            "medium",
            "creation_date",
            "upload_date",
            "location_name",
            "latitude",
            "longitude",
            "artist",
            "likes",
            "views",
            "total_likes",
        ]
        extra_kwargs = {"image": {"required": False}}

    def create(self, validated_data):
        image_url = validated_data.pop("image_url", None)
        if image_url:
            validated_data["image"] = image_url
        return super().create(validated_data)

    def get_total_likes(self, obj):
        return obj.total_likes()


@api_view(["POST"])
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        username = request.data.get("username")
        password = request.data.get("password")

        # Check if username and password are provided
        if not username or not password:
            return Response(
                {"errors": {"general": "Username and password are required"}}, status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            profile = get_object_or_404(Profile, user=user)
            serializer = ProfileSerializer(profile)
            return Response({"access": str(refresh.access_token), "refresh": str(refresh), "user": serializer.data})

        return Response({"errors": {"general": "Invalid username or password"}}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"errors": {"general": "Method not allowed"}}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@login_required
def auth_complete(request):
    try:
        user = request.user
        social = user.social_auth.filter(provider="google-oauth2").first()
        if not social:
            return JsonResponse({"error": "No social auth found"}, status=400)

        extra_data = social.extra_data

        email = extra_data.get("email")
        if not email:
            return JsonResponse({"error": "No email provided by Google"}, status=400)

        name = extra_data.get("fullname") or extra_data.get("name") or email.split("@")[0]
        picture = extra_data.get("picture", "")

        existing_user = User.objects.filter(email=email).exclude(id=user.id).first()
        if existing_user:
            social.user = existing_user
            social.save()
            user.delete()
            user = existing_user
        else:
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exclude(id=user.id).exists():
                username = f"{base_username}{counter}"
                counter += 1
            user.username = username

        user.email = email
        user.save()

        profile, created = Profile.objects.get_or_create(user=user)
        if created:
            profile.bio = ""
            profile.website = ""
            profile.save()

        refresh = RefreshToken.for_user(user)
        frontend_url = "http://localhost:3000"

        user_data = {"username": user.username, "email": email, "name": name, "picture": picture}

        redirect_url = (
            f"{frontend_url}/auth/complete?"
            f"access={str(refresh.access_token)}&"
            f"refresh={str(refresh)}&"
            f"user={json.dumps(user_data)}"
        )
        return redirect(redirect_url)

    except Exception as e:
        import traceback

        return JsonResponse({"error": "OAuth flow failed", "details": str(e)}, status=500)


class TokenObtainPairView(APIView):
    @csrf_exempt
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            profile = get_object_or_404(Profile, user=user)
            serializer = ProfileSerializer(profile)
            return Response({"access": str(refresh.access_token), "refresh": str(refresh), "user": serializer.data})
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class TokenRefreshView(APIView):
    @csrf_exempt
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            return Response({"access": str(refresh.access_token)})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = get_object_or_404(Profile, user=user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)


@api_view(["POST"])
@csrf_exempt
def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.data)
        if form.is_valid():
            try:
                user = form.register_user()
                refresh = RefreshToken.for_user(user)
                return Response(
                    {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "redirect_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth",
                    }
                )
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": form.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_photo(request, username):
    user = get_object_or_404(User, username=username)
    profile = get_object_or_404(Profile, user=user)

    if not profile.profile_picture:
        raise Http404("No profile picture found.")

    try:
        with profile.profile_picture.open("rb") as f:
            return HttpResponse(
                f.read(),
                content_type=mimetypes.guess_type(profile.profile_picture.path)[0],
            )
    except Exception as e:
        raise Http404(f"Error reading profile picture: {str(e)}")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            return Response({"message": "Successfully logged out"})
        return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def profile_setup(request):
    try:
        profile = request.user.profile
        if not profile:
            profile = Profile.objects.create(user=request.user)

        profile.bio = request.data.get("bio", "")
        profile.website = request.data.get("website", "")

        if "profile_picture" in request.FILES:
            profile.profile_picture = request.FILES["profile_picture"]

        profile.save()

        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@login_required
def map_view(request):
    artworks = Artwork.objects.all()
    artworks_dicts = []
    for artwork in artworks:
        artwork_dict = {
            "title": artwork.title,
            "description": artwork.description,
            "image": artwork.image.url,
            "medium": artwork.medium,
            "creation_date": artwork.creation_date,
            "location_name": artwork.location_name,
            "latitude": artwork.latitude,
            "longitude": artwork.longitude,
            "likes": artwork.likes.count(),
        }
        artworks_dicts.append(artwork_dict)
    return render(request, "map_art_community/map.html", {"artworks": artworks_dicts})


class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "user__username"
    lookup_url_kwarg = "username"

    def get_queryset(self):
        if self.action == "list":
            return Profile.objects.filter(user=self.request.user)
        username = self.kwargs.get("username")
        if username:
            return Profile.objects.filter(user__username=username)
        return Profile.objects.none()

    def get_object(self):
        username = self.kwargs.get("username")
        if not username:
            return get_object_or_404(Profile, user=self.request.user)
        try:
            return Profile.objects.get(user__username=username)
        except Profile.DoesNotExist:
            raise Http404(f"Profile for user {username} does not exist")

    def update(self, request, *args, **kwargs):
        try:
            profile = self.get_object()

            profile.bio = request.data.get("bio", profile.bio)
            profile.website = request.data.get("website", profile.website)

            if "profile_picture" in request.FILES:
                profile.profile_picture = request.FILES["profile_picture"]

            profile.save()

            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ArtworkViewSet(ModelViewSet):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Artwork.objects.all().order_by("-upload_date")

    def perform_create(self, serializer):
        if "image" not in self.request.FILES:
            raise serializers.ValidationError({"error": "Image is required"})

        artwork = serializer.save(artist=self.request.user)
        image = self.request.FILES["image"]
        filename = f"{artwork.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{image.name}"
        artwork.image.save(filename, image)
        artwork.save()

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            data = request.data.copy()

            update_fields = [
                "title",
                "description",
                "medium",
                "creation_date",
                "location_name",
                "latitude",
                "longitude",
            ]

            for field in update_fields:
                if field in data:
                    value = data[field]
                    if value is not None and value != "":
                        setattr(instance, field, value)

            if "image" in request.FILES:
                image = request.FILES["image"]
                filename = f"{instance.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{image.name}"
                instance.image.save(filename, image)

            instance.save(update_fields=update_fields)
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Artwork.DoesNotExist:
            raise serializers.ValidationError({"error": "Artwork not found"})
        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})


class GalleryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        artworks = Artwork.objects.all().order_by("-upload_date")
        serializer = ArtworkSerializer(artworks, many=True)
        return Response(serializer.data)


def social_auth_error(request):
    return Response({"error": "Authentication failed. Please try again."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
def oauth_complete(request):
    if request.user.is_authenticated:
        social = request.user.social_auth.get(provider="google-oauth2")
        response = requests.get(
            "https://www.googleapis.com/oauth2/v1/userinfo", params={"access_token": social.extra_data["access_token"]}
        )
        google_info = response.json()

        email = google_info.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = request.user
            user.email = email
            user.save()

        refresh = RefreshToken.for_user(user)
        profile = get_object_or_404(Profile, user=user)
        serializer = ProfileSerializer(profile)

        redirect_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        redirect_url += "/gallery"

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": serializer.data,
                "redirect_url": redirect_url,
            }
        )
    return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["GET"])
def google_oauth(request):
    return redirect("social:begin", backend="google-oauth2")


@api_view(["GET"])
def get_csrf_token(request):
    return Response({"detail": "CSRF cookie set"})


def _lat(GPSLatitudeRef, GPSLatitude):
    lat = float(GPSLatitude[0]) + float(GPSLatitude[1]) / 60 + float(GPSLatitude[2]) / 3600
    if GPSLatitudeRef != "N":
        lat = -lat
    return lat


def _lng(GPSLongitudeRef, GPSLongitude):
    lng = float(GPSLongitude[0]) + float(GPSLongitude[1]) / 60 + float(GPSLongitude[2]) / 3600
    if GPSLongitudeRef != "E":
        lng = -lng
    return lng


def _extract_metadata(image_path):
    meta = {
        "lat": None,
        "lng": None,
        "date": None,
    }
    image = Image.open(image_path)
    exif_data = image._getexif()
    if exif_data:
        gps_info = exif_data.get(34853)
        if gps_info:
            meta["lat"] = _lat(gps_info[1], gps_info[2])
            meta["lng"] = _lng(gps_info[3], gps_info[4])
        date_info = exif_data.get(306)
        if date_info:
            dt = datetime.strptime(date_info, "%Y:%m:%d %H:%M:%S")
            meta["date"] = dt.strftime("%Y-%m-%d")
    return meta


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_image(request):
    if "image" not in request.FILES:
        return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        image = request.FILES["image"]
        if not image.content_type.startswith("image/"):
            return Response({"error": "File is not an image"}, status=status.HTTP_400_BAD_REQUEST)

        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(image.read())
        temp_file.close()

        meta = _extract_metadata(temp_file.name)

        os.unlink(temp_file.name)

        extracted_info = {
            "creation_date": meta["date"],
            "latitude": meta["lat"],
            "longitude": meta["lng"],
        }

        return Response(extracted_info)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@permission_classes([IsAuthenticated])
@api_view(["GET"])
def check_artwork_like(request, artwork_id):
    try:
        artwork = Artwork.objects.get(id=artwork_id)
        
        is_liked = request.user in artwork.likes.all()
        
        return Response({
            'liked': is_liked,
            'likes_count': artwork.total_likes()
        })
    except Artwork.DoesNotExist:
        return Response({'error': 'Artwork not found'}, status=404)

## TODO: 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_artwork(request, artwork_id):
    
    try:
        if not request.user.is_authenticated:
            return Response({'error': 'User not authenticated'}, status=401)
        
        artwork = Artwork.objects.get(id=artwork_id)
        user = request.user
        
        if user in artwork.likes.all():
            artwork.likes.remove(user)
            action = 'unliked'
        else:
            artwork.likes.add(user)
            action = 'liked'
        
        artwork.save()
        print(f"User {user.username} {action} artwork {artwork.id}")
        
        return Response({
            'status': 'success',
            'action': action,
            'likes_count': artwork.total_likes(),
        })
    except Artwork.DoesNotExist:
        return Response({'error': 'Artwork not found'}, status=404)