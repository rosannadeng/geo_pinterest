from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import DetailView, CreateView, UpdateView, ListView
from django.contrib import messages
from django.http import Http404, HttpResponse
from django.urls import reverse_lazy
from django.contrib.auth.models import User
from .models import Profile, Artwork
import mimetypes
from .forms import LoginForm, RegisterForm, ProfileForm, ArtworkForm
from social_core.exceptions import AuthFailed


def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        try:
            user = form.login_valid()
            login(request, user)
            return redirect("home")
        except:
            messages.error(request, "Invalid username or password")
    else:
        form = LoginForm()
    return render(request, "map_art_community/login.html", {"form": form})


def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            try:
                user = form.register_user()
                login(request, user)
                return redirect("profile_setup")
            except Exception as e:
                messages.error(request, str(e))
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = RegisterForm()
    return render(request, "map_art_community/register.html", {"form": form})


@login_required
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


@login_required
def logout_view(request):
    logout(request)
    return redirect("login")


@login_required
def profile_setup(request):
    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully!")
            return redirect("profile")
    else:
        form = ProfileForm(instance=request.user.profile)
    return render(request, "map_art_community/profile_setup.html", {"form": form})


class ProfileView(LoginRequiredMixin, DetailView):
    model = Profile
    template_name = "map_art_community/profile.html"
    context_object_name = "profile"

    def get_object(self):
        username = self.kwargs.get("username", self.request.user.username)
        return get_object_or_404(Profile, user__username=username)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["artworks"] = self.object.user.artworks.all()
        return context


class ArtworkCreateView(LoginRequiredMixin, CreateView):
    model = Artwork
    form_class = ArtworkForm
    template_name = "map_art_community/artwork_form.html"
    success_url = reverse_lazy("home")

    def form_valid(self, form):
        form.instance.artist = self.request.user
        return super().form_valid(form)


class ArtworkUpdateView(LoginRequiredMixin, UpdateView):
    model = Artwork
    form_class = ArtworkForm
    template_name = "map_art_community/artwork_form.html"
    success_url = reverse_lazy("home")

    def get_queryset(self):
        return Artwork.objects.filter(artist=self.request.user)



class GalleryView(LoginRequiredMixin, ListView):
    model = Artwork
    template_name = "map_art_community/gallery.html"
    context_object_name = "artworks"
    paginate_by = 12

    def get_queryset(self):
        return Artwork.objects.all().order_by("-upload_date")
    
    
    
def social_auth_error(request):
    messages.error(request, "Authentication failed. Please try again.")
    return redirect('login')

 
