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

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.ArtworkCreateView.as_view(), name="home"),
    path("register", views.register_view, name="register"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("profile", views.ProfileView.as_view(), name="profile"),
    path("profile/<str:username>", views.ProfileView.as_view(), name="user_profile"),
    path("profile/setup", views.profile_setup, name="profile_setup"),
    path("artwork/create", views.ArtworkCreateView.as_view(), name="artwork_create"),
    path(
        "artwork/<int:pk>/update",
        views.ArtworkUpdateView.as_view(),
        name="artwork_update",
    ),
    path("map", views.map_view, name="map"),
    path("gallery", views.GalleryView.as_view(), name="gallery"),
    path('oauth/', include('social_django.urls', namespace='social')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
