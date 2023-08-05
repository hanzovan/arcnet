import json
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .helpers import strong_password
from .models import User, Post


# Create your views here.
def index(request):

    # Get message
    yay_message = request.session.get('yay_message', '')
    nay_message = request.session.get('nay_message', '')

    request.session['yay_message'] = ''
    request.session['nay_message'] = ''

    # Get posts
    posts = Post.objects.all().order_by("-created")

    return render(request, "arc/index.html", {
        "yay_message": yay_message,
        "nay_message": nay_message,
        "posts": posts
    })


# Get posts from a specific page
def get_posts(request, page_number):
    # Get all posts and turn them into pages
    posts = Post.objects.all().order_by("-created")
    paging = Paginator(posts, 10)

    # Get the current page which user choses
    page_obj = paging.get_page(page_number)

    return JsonResponse({
        'posts': [post.serialize() for post in page_obj]
    })

# Allow user to create their own account
def register(request):
    # If user reached route via submiting form
    if request.method == 'POST':
        # Define variables
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirm = request.POST['confirmation']

        if not username or not email or not password or not confirm:
            return render(request, "arc/register.html", {
                "nay_message": "Missing credentials"
            })

        if confirm != password:
            return render(request, "arc/register.html", {
                "nay_message":"Passwords don't match"
            })

        if not strong_password(password):
            return render(request, "arc/register.html", {
                "nay_message": "Your password is not strong enough"
            })

        # If all requirement are met, try create a new user
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            # Log the user in
            login(request, user)

            # Inform successfully
            request.session['yay_message'] = 'Registered successfully'
            
            # Redirect user to index route
            return HttpResponseRedirect(reverse('index'))

        # If username already exist, raise error
        except IntegrityError:
            return render(request, "arc/register.html", {
                "nay_message": "Username already existed"
            })

    # If user reach route via clicking link or being redirected
    else:
        return render(request, "arc/register.html")


# Allow user to log into their account
def login_view(request):
    # If user reaching route via submiting form
    if request.method == 'POST':
        # Define variables
        username = request.POST['username']
        password = request.POST.get('password', '')

        # Check requirement
        if not username:
            return render(request, "arc/login.html", {
                "nay_message": "Missing username"
            })

        # Try to log in
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            request.session['yay_message'] = 'Logged in successfully'
            return HttpResponseRedirect(reverse('index'))
        else:
            return render(request, "arc/login.html", {
                "nay_message": "Invalid credentials"
            })

    # If user reached route via clicking link or being redirected
    else:
        return render(request, "arc/login.html")


# Allow user to log out
@login_required
def logout_view(request):
    logout(request)
    request.session['yay_message'] = 'Logged out successfully'
    return HttpResponseRedirect(reverse('index'))


# Allow user to create new post
@csrf_exempt
@login_required
def compose_post(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=400)
    
    data = json.loads(request.body)

    if data.get('content') is not None:
        new_post = Post(
            author = request.user,
            content = data['content']
        )
        new_post.save()

    return JsonResponse({'message': 'Post saved'})

