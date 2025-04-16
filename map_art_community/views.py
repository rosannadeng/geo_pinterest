from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Profile, Artwork, Comment
import mimetypes
import json
from .forms import RegisterForm
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework import serializers
import os
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
from datetime import datetime
import tempfile
from django.conf import settings
import logging


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    featured_artwork = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["user", "bio", "profile_picture", "website", "featured_artwork"]

    def get_featured_artwork(self, obj):
        if obj.featured_artwork:
            request = self.context.get('request')
            if request is not None:
                return {
                    'id': obj.featured_artwork.id,
                    'title': obj.featured_artwork.title,
                    'image': request.build_absolute_uri(obj.featured_artwork.image.url),
                    'artist_username': obj.featured_artwork.artist.username,
                    'artist_profile_picture': request.build_absolute_uri(obj.featured_artwork.artist.profile.profile_picture.url) if obj.featured_artwork.artist.profile.profile_picture else None,
                    'total_likes': obj.featured_artwork.total_likes(),
                    'is_liked': obj.featured_artwork.likes.filter(id=request.user.id).exists() if request.user.is_authenticated else False
                }
            return {
                'id': obj.featured_artwork.id,
                'title': obj.featured_artwork.title,
                'image': obj.featured_artwork.image.url,
                'artist_username': obj.featured_artwork.artist.username,
                'artist_profile_picture': obj.featured_artwork.artist.profile.profile_picture.url if obj.featured_artwork.artist.profile.profile_picture else None,
                'total_likes': obj.featured_artwork.total_likes(),
                'is_liked': False
            }
        return None

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.SerializerMethodField()
    user_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'comment', 'created_at', 'user', 'username', 'user_profile_picture']
        read_only_fields = ['created_at', 'user']

    def get_username(self, obj):
        return obj.user.username

    def get_user_profile_picture(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.user.profile.profile_picture.url)
            return obj.user.profile.profile_picture.url
        return None


class ArtworkSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(required=False, write_only=True)
    artist = serializers.PrimaryKeyRelatedField(read_only=True)
    total_likes = serializers.SerializerMethodField()
    artist_username = serializers.SerializerMethodField()
    artist_profile_picture = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

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
            "artist_username",
            "artist_profile_picture",
            "likes",
            "views",
            "total_likes",
            "is_liked",
            "comments",
        ]
        extra_kwargs = {"image": {"required": False}}

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def create(self, validated_data):
        image_url = validated_data.pop("image_url", None)
        if image_url:
            validated_data["image"] = image_url
        return super().create(validated_data)

    def get_total_likes(self, obj):
        return obj.likes.count()

    def get_artist_username(self, obj):
        return obj.artist.username if obj.artist else None

    def get_artist_profile_picture(self, obj):
        if obj.artist and hasattr(obj.artist, "profile") and obj.artist.profile.profile_picture:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.artist.profile.profile_picture.url)
            return obj.artist.profile.profile_picture.url
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False




@api_view(["POST"])
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
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')  
            profile = get_object_or_404(Profile, user=user)
            serializer = ProfileSerializer(profile)
            return Response({"user": serializer.data})

        return Response({"errors": {"general": "Invalid username or password"}}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"errors": {"general": "Method not allowed"}}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@login_required
def auth_complete(request):
    logger = logging.getLogger(__name__)
    logger.debug(f"OAuth request received: {request.GET}")
    try:
        user = request.user
        social = user.social_auth.filter(provider="google-oauth2").first()
        if not social:
            return JsonResponse({"error": "No social auth found"}, status=400)

        extra_data = social.extra_data

        email = extra_data.get("email")
        if not email:
            return JsonResponse({"error": "No email provided by Google"}, status=400)

        existing_user = User.objects.filter(email=email).exclude(id=user.id).first()
        if existing_user:
            social.user = existing_user
            social.save()
            user.delete()
            user = existing_user
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
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

        frontend_url = settings.FRONTEND_URL
        user_data = {
            "username": user.username,
            "email": email,
            "name": extra_data.get("name", ""),
            "picture": extra_data.get("picture", "")
        }

        redirect_url = f"{frontend_url}/auth/complete?user={json.dumps(user_data)}"
        print("Redirect URL:", redirect_url)
        return redirect(redirect_url)

    except Exception as e:
        return JsonResponse({"error": "OAuth flow failed", "details": str(e)}, status=500)


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = get_object_or_404(Profile, user=user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)


@api_view(["POST"])
def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.data)
        if form.is_valid():
            try:
                user = form.register_user()
                return Response(
                    {
                        'message': 'Registration successful, please login',
                        "redirect_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth",
                    }
                )
            except Exception as e:
                return Response({"errors": {"errors": str(e)}}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert Django form errors to a format that works with frontend
        errors = {}
        for field, error_list in form.errors.items():
            errors[field] = error_list[0] if error_list else "Invalid data"
        
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)


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
@login_required
def logout_view(request):
    try:
        logout(request)  # Use Django session logout
        return Response({"message": "Successfully logged out"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@login_required
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
    lookup_field = "user__username"
    lookup_url_kwarg = "username"

    def get_queryset(self):
        queryset = Artwork.objects.all().order_by("-upload_date")
        artist_username = self.request.query_params.get('artist')

        if artist_username:
            queryset = queryset.filter(artist__username=artist_username)

        return queryset

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
            
            if profile.user != request.user:
                return Response(
                    {"error": "You do not have permission to edit this profile"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

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

    def get_queryset(self):
        queryset = Artwork.objects.all().order_by("-upload_date")
        artist_username = self.request.query_params.get('artist')
        
        if artist_username:
            queryset = queryset.filter(artist__username=artist_username)
        return queryset

    def perform_create(self, serializer):
        if "image" not in self.request.FILES:
            raise serializers.ValidationError({"error": "Image is required"})

        artwork = serializer.save(artist=self.request.user)
        image = self.request.FILES["image"]
        filename = f"{artwork.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{image.name}"
        artwork.image.save(filename, image)
        artwork.save()

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            profiles = Profile.objects.filter(featured_artwork=instance)
            
            profiles.update(featured_artwork=None)
            
            instance.delete()
            
            return Response(
                {
                    "message": "Artwork deleted successfully",
                    "cleared_featured": profiles.count()
                }, 
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

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
@login_required
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
            "image_url": temp_file.name,
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

        return Response({"liked": is_liked, "likes_count": artwork.total_likes()})
    except Artwork.DoesNotExist:
        return Response({"error": "Artwork not found"}, status=404)



@api_view(["POST"])
@login_required
def add_comment(request, artwork_id):
    try:
        if not request.user.is_authenticated:
            return Response({"error": "Please login to add comments"}, status=401)
            
        artwork = Artwork.objects.get(id=artwork_id)
        comment_text = request.data.get('comment')
        
        if not comment_text or len(comment_text.strip()) == 0:
            return Response({"error": "Comment cannot be empty"}, status=400)
            
        comment = Comment.objects.create(
            artwork=artwork,
            user=request.user,
            comment=comment_text
        )
        
        comment = Comment.objects.select_related('user', 'user__profile').get(id=comment.id)
        serializer = CommentSerializer(comment, context={'request': request})
        
        return Response({
            'id': comment.id,
            'comment': comment.comment,
            'created_at': comment.created_at,
            'user': {
                'id': comment.user.id,
                'username': comment.user.username
            },
            'username': comment.user.username,
            'user_profile_picture': request.build_absolute_uri(comment.user.profile.profile_picture.url) if hasattr(comment.user, 'profile') and comment.user.profile.profile_picture else None
        }, status=201)
    except Artwork.DoesNotExist:
        return Response({"error": "Artwork not found"}, status=404)
    except Exception as e:
        print("Error:", str(e))
        return Response({"error": f"Failed to add comment: {str(e)}"}, status=400)

@api_view(['GET'])
@login_required
def get_comments(request, artwork_id):
    try:
        artwork = Artwork.objects.get(id=artwork_id)
        comments = artwork.comments.all().order_by('-created_at')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    except Artwork.DoesNotExist:
        return Response({'error': 'Artwork not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
@login_required
def get_featured_artwork(request, username):
    try:
        user = User.objects.get(username=username)
        profile = user.profile
        if profile.featured_artwork:
            serializer = ArtworkSerializer(profile.featured_artwork, context={'request': request})
            return Response(serializer.data)
        return Response({"message": "No featured artwork"}, status=200)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

@api_view(['GET'])
@login_required
def get_artwork_likers(request, artwork_id):
    try:
        if not request.user.is_authenticated:
            return Response({"error": "Please login to view likers"}, status=401)
            
        artwork = Artwork.objects.get(id=artwork_id)
        likers = artwork.likes.all()
        likers_data = []
        for liker in likers:
            profile_picture = None
            if hasattr(liker, 'profile') and liker.profile.profile_picture:
                profile_picture = request.build_absolute_uri(liker.profile.profile_picture.url)
            likers_data.append({
                'id': liker.id,
                'username': liker.username,
                'profile_picture': profile_picture
            })
        return Response(likers_data)
    except Artwork.DoesNotExist:
        return Response({"error": "Artwork not found"}, status=404)
    except Exception as e:
        return Response({"error": f"Failed to get likers: {str(e)}"}, status=400)

@api_view(['POST'])
@login_required
def like_artwork(request, artwork_id):
    try:
        if not request.user.is_authenticated:
            return Response({"error": "Please login to like artwork"}, status=401)
            
        artwork = Artwork.objects.get(id=artwork_id)
        user = request.user
        profile = user.profile

        if user in artwork.likes.all():
            artwork.likes.remove(user)
            action = "unliked"
            if profile.featured_artwork == artwork:
                profile.featured_artwork = None
                profile.save()
        else:
            artwork.likes.add(user)
            action = "liked"
            if not profile.featured_artwork:
                profile.featured_artwork = artwork
                profile.save()

        artwork.save()
        return Response({
            "status": "success",
            "action": action,
            "likes_count": artwork.total_likes(),
        })
    except Artwork.DoesNotExist:
        return Response({"error": "Artwork not found"}, status=404)
    except Exception as e:
        return Response({"error": f"Failed to like artwork: {str(e)}"}, status=400)
