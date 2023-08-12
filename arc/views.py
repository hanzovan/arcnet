import json
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .helpers import strong_password
from .models import User, Post, Like, Reply


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
@csrf_exempt
def get_posts(request, page_number):
    # Get all posts and turn them into pages
    posts = Post.objects.all().order_by("-created")
    paging = Paginator(posts, 10)

    # Get the current page which user choses
    page_obj = paging.get_page(page_number)

    # Confirm whether current page has next or last page
    has_next_page = page_obj.has_next()
    if has_next_page:
        next_page = page_obj.next_page_number()
    else:
        next_page = 'none'

    has_previous_page = page_obj.has_previous()
    if has_previous_page:
        previous_page = page_obj.previous_page_number()
    else:
        previous_page = 'none'

    return JsonResponse({
        'posts': [post.serialize() for post in page_obj],
        'has_next_page': has_next_page,
        'has_previous_page': has_previous_page,
        'next_page': next_page,
        'previous_page': previous_page,
        'last_page': page_obj.paginator.num_pages,
        'current_page': page_obj.number
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


# Allow user to like post, user has to login first
@login_required
@csrf_exempt
def like_post(request):
    # method has to be POST
    if request.method != 'POST':
        return JsonResponse({'error':"POST method required"}, status=400)
    
    # get the data from browser
    data = json.loads(request.body)

    if data.get('post_id') is not None:
        post_id = data['post_id']

        # then get the post id and current user id
        reader= request.user

        # If this like already exist, delete it, else create it
        try:
            old_like = Like.objects.get(post=Post.objects.get(pk=post_id), reader=reader)
            old_like.delete()
        except Like.DoesNotExist:
            # Create a like object
            like = Like(post = Post.objects.get(pk=post_id), reader = reader)
            like.save()           

    return JsonResponse({'message': 'Liked post'}, safe=False)
    

# Update like for each post
@csrf_exempt
def update_like(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'}, status=400)
    
    data = json.loads(request.body)
    if data.get('post_id') is not None:
        post = Post.objects.get(pk=data['post_id'])
        like_count = Like.objects.filter(post=post).count()

    return JsonResponse({'like_count': like_count}, safe=False)


# Allow user to see the author's profile
@csrf_exempt
def profile(request, author_id):
    author = User.objects.get(pk=author_id)
    posts = Post.objects.filter(author=author).order_by("-created")    

    # add all replies to each post
    post_data = []
    for post in posts:
        post_info = post.serialize()

        # Beside the fields that already in the post.serialize, add replies relevant to the post
        post_info['replies'] = [reply.serialize() for reply in post.replies.all()]
        post_info['replies_count'] = post.replies.all().count()
        post_data.append(post_info)

    # Calculate the number of following and follower of this author    
    following_users = author.following.all()
    following_count = following_users.count()
    
    followers = User.objects.filter(following=author)
    followers_count = followers.count()   

    # Set up paging
    paging = Paginator(post_data, 10)
    page_number = request.GET.get('page')
    page_obj = paging.get_page(page_number)

    # If user logged in, define if user is author or not
    if request.user.is_authenticated:
        # Define that user is author or not
        user_is_author = request.user == author

        # Confirm that current user is followers or not
        followed = request.user in followers

        return render(request, "arc/profile.html", {
            "user_is_author": user_is_author,
            "author": author,
            "page_obj": page_obj,
            "followed": followed,
            "following": following_count,
            "followers": followers_count
        })

    else:
        return render(request, "arc/profile.html", {
            "page_obj": page_obj,
            "author": author,
            "following": following_count,
            "followers": followers_count
        })


# Allow user to follow an author
@login_required
def follow_user(request):
    # the method have to be POST
    if request.method == 'POST':
        # Look for the author
        author_id = request.POST['author_id']
        author = User.objects.get(pk=author_id)

        # If user already followed this author
        if author in request.user.following.all():
            request.user.following.remove(author)
        else:
            request.user.following.add(author)

        return redirect('profile', author_id=author_id)


# Allow user to access posts from his/her following authors
@login_required
def following_page(request):
    # Get the user, then the authors that user following
    user = request.user
    authors = user.following.all()

    # From the authors, get their posts
    posts = Post.objects.filter(author__in=authors).order_by("-created")

    paging = Paginator(posts, 10)

    page_number = request.GET.get('page')

    page_obj = paging.get_page(page_number)

    return render(request, "arc/following_page.html", {
        "page_obj": page_obj
    })


# Allow user to edit their own post
@login_required
@csrf_exempt
def edit_post(request):
    # Require POST method
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=400)
    # Get data from JavaScript
    data = json.loads(request.body)
    if data.get('post_id') is not None:
        # Get the post
        post_id = data['post_id']       
        post = Post.objects.get(pk=post_id)

        # Confirm that user is the author
        if request.user != post.author:
            return JsonResponse({'error': 'You are not author of this post'}, status=400)

        if data['type'] == 'edit':
            content = data.get('content', '')
            post.content = content
            post.save()

        if data['type'] == 'delete':
            post.delete()
            
    return JsonResponse({'message': 'Post edited'})


# Allow user to create reply to a post
@login_required
@csrf_exempt
def reply(request):
    # the method have to be POST
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=400)
    data = json.loads(request.body)
    if data.get('reply_content') is not None:
        reply_content = data['reply_content']
        post_id = data['post_id']
        new_reply = Reply(
            post = Post.objects.get(pk=post_id),
            commentor = request.user,
            comment = reply_content
        )
        new_reply.save()
        return JsonResponse({'message': 'Reply saved'})
    return JsonResponse({'error': 'reply can not be blank'}, status=400)