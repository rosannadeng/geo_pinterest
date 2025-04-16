"""
URL configuration for webapps project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import map_art_community.views as views
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet

router = DefaultRouter()
router.register(r"profile", views.ProfileViewSet, basename="profile")
router.register(r"artwork", views.ArtworkViewSet, basename="artwork")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.GalleryView.as_view(), name="home"),
    path("register", views.register_view, name="register"),
    path("auth/complete/", views.auth_complete, name="auth_complete"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("user", views.UserView.as_view(), name="user"),
    path("get_csrf_token", views.get_csrf_token, name="get_csrf_token"),
    path("profile", views.ProfileViewSet.as_view({"get": "list"}), name="profile_list"),
    path(
        "profile/<str:username>",
        views.ProfileViewSet.as_view({"get": "retrieve"}),
        name="profile_detail",
    ),
    path("profile/<str:username>/edit", views.ProfileViewSet.as_view({"put": "update"}), name="profile_update"),
    path("profile/setup", views.profile_setup, name="profile_setup"),
    path("profile/<str:username>/photo", views.get_photo, name="profile_photo"),
    path("artwork", views.ArtworkViewSet.as_view({"get": "list"}), name="artwork_list"),
    path("artwork/create", views.ArtworkViewSet.as_view({"post": "create"}), name="artwork_create"),
    path("artwork/<int:pk>/delete", views.ArtworkViewSet.as_view({"delete": "destroy"}), name="artwork_delete"),
    path("artwork/upload-image", views.upload_image, name="upload_image"),
    path("artwork/<int:pk>", views.ArtworkViewSet.as_view({"get": "retrieve"}), name="artwork_detail"),
    path("gallery", views.GalleryView.as_view(), name="gallery"),
    path("oauth/", include("social_django.urls", namespace="social")),
    path("artwork/<int:artwork_id>/comments/add", views.add_comment, name="add_comment"),
    path("artwork/<int:artwork_id>/comments", views.get_comments, name="get_comments"),
    # add artwork like/unlike
    path("artwork/<int:artwork_id>/like/", views.like_artwork, name="like_artwork"),
    path("artwork/<int:artwork_id>/check_if_liked/", views.check_artwork_like, name="check_artwork_like"),
    path("artwork/<int:artwork_id>/likers", views.get_artwork_likers, name="get_artwork_likers"),
    path("profile/<str:username>/featured-artworks", views.get_featured_artwork, name="get_featured_artwork"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
