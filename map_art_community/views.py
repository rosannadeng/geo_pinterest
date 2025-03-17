from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib import messages
from django.http import JsonResponse, HttpResponse, Http404
from django.urls import reverse_lazy
from django.db.models import Count
from django.contrib.auth.models import User
from django.conf import settings
import os
import mimetypes
from .models import Profile, Artwork, Comment
from .forms import (
    LoginForm, RegisterForm, ProfileForm, ArtworkForm,CommentForm, ArtworkSearchForm
)

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        try:
            user = form.login_valid()
            login(request, user)
            return redirect('home')
        except:
            messages.error(request, "Invalid username or password")
    else:
        form = LoginForm()
    return render(request, 'map_art_community/login.html', {'form': form})

def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        try:
            user = form.register_user()
            login(request, user)
            return redirect('profile_setup')
        except Exception as e:
            messages.error(request, str(e))
    else:
        form = RegisterForm()
    return render(request, 'map_art_community/register.html', {'form': form})

@login_required
def get_photo(request, username):
    user = get_object_or_404(User, username=username)
    profile = get_object_or_404(Profile, user=user)
    
    if not profile.profile_picture:
        raise Http404("No profile picture found.")
        
    try:
        with profile.profile_picture.open('rb') as f:
            return HttpResponse(f.read(), content_type=mimetypes.guess_type(profile.profile_picture.path)[0])
    except Exception as e:
        raise Http404(f"Error reading profile picture: {str(e)}")

@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def profile_setup(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
    else:
        form = ProfileForm(instance=request.user.profile)
    return render(request, 'map_art_community/profile_setup.html', {'form': form})

class ProfileView(LoginRequiredMixin, DetailView):
    model = Profile
    template_name = 'map_art_community/profile.html'
    context_object_name = 'profile'

    def get_object(self):
        return self.request.user.profile

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['artworks'] = self.request.user.artworks.all()
        return context

class ArtworkListView(ListView):
    model = Artwork
    template_name = 'map_art_community/home.html'
    context_object_name = 'artworks'
    paginate_by = 12

    def get_queryset(self):
        queryset = Artwork.objects.all()
        form = ArtworkSearchForm(self.request.GET)
        
        if form.is_valid():
            if form.cleaned_data['search']:
                queryset = queryset.filter(title__icontains=form.cleaned_data['search'])
            if form.cleaned_data['medium']:
                queryset = queryset.filter(medium=form.cleaned_data['medium'])
            if form.cleaned_data['date_from']:
                queryset = queryset.filter(creation_date__gte=form.cleaned_data['date_from'])
            if form.cleaned_data['date_to']:
                queryset = queryset.filter(creation_date__lte=form.cleaned_data['date_to'])
            
            sort_by = form.cleaned_data['sort_by']
            if sort_by == 'popular':
                queryset = queryset.annotate(like_count=Count('likes')).order_by('-like_count')
            elif sort_by == 'views':
                queryset = queryset.order_by('-views')
            else:  # recent
                queryset = queryset.order_by('-upload_date')
                
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_form'] = ArtworkSearchForm(self.request.GET)
        return context

class ArtworkDetailView(DetailView):
    model = Artwork
    template_name = 'map_art_community/artwork_detail.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['comment_form'] = CommentForm()
        # Increment view count
        self.object.views += 1
        self.object.save()
        return context

class ArtworkCreateView(LoginRequiredMixin, CreateView):
    model = Artwork
    form_class = ArtworkForm
    template_name = 'map_art_community/artwork_form.html'
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        form.instance.artist = self.request.user
        return super().form_valid(form)

class ArtworkUpdateView(LoginRequiredMixin, UpdateView):
    model = Artwork
    form_class = ArtworkForm
    template_name = 'map_art_community/artwork_form.html'

    def get_queryset(self):
        return Artwork.objects.filter(artist=self.request.user)

class ArtworkDeleteView(LoginRequiredMixin, DeleteView):
    model = Artwork
    success_url = reverse_lazy('home')
    template_name = 'map_art_community/artwork_confirm_delete.html'

    def get_queryset(self):
        return Artwork.objects.filter(artist=self.request.user)

@login_required
def like_artwork(request, pk):
    artwork = get_object_or_404(Artwork, pk=pk)
    if request.user in artwork.likes.all():
        artwork.likes.remove(request.user)
        liked = False
    else:
        artwork.likes.add(request.user)
        liked = True
    return JsonResponse({
        'liked': liked,
        'count': artwork.likes.count()
    })

@login_required
def add_comment(request, pk):
    artwork = get_object_or_404(Artwork, pk=pk)
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.artwork = artwork
            comment.author = request.user
            comment.save()
            messages.success(request, 'Comment added successfully!')
        else:
            messages.error(request, 'Error adding comment.')
    return redirect('artwork_detail', pk=pk)



@login_required
def delete_bookmark(request, pk):
    bookmark = get_object_or_404(LocationBookmark, pk=pk, user=request.user)
    bookmark.delete()
    messages.success(request, 'Bookmark deleted successfully!')
    return redirect('profile')
