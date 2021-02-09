from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django import forms
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import json

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")



@csrf_exempt
@login_required
def create(request):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
   
    data = json.loads(request.body)
    text = data.get('text',)
    author = request.user
    post = Post(user=author, text=text, timestamp=timezone.now())
    post.save()

    return JsonResponse({"message": "Post published successfully."}, status=201)


def posts(request, area, page_n):
    

    if area == "all_posts":
        allposts = Post.objects.all().order_by("-timestamp")

    elif area == "following":
        follower = request.user
        following_list = []
        users = User.objects.all()
        for user in users:
            user_followers = user.followers.all()
            if follower in user_followers:
                following_list.append(user)
        allposts = []
        for following in following_list:
            allposts += Post.objects.filter(user = following)

    else:
        user_id = int(area)
        posts_non_order = Post.objects.filter(user = user_id)
        allposts = posts_non_order.order_by("-timestamp").all()
        
    p = Paginator(allposts, 3)
    number_of_pages = p.num_pages

    try:
        posts = p.page(page_n)
    except PageNotAnInteger:
        posts = p.page(1)
    except EmptyPage:
        posts = p.page(p.num_pages)
    
    answer = {
        'posts': [post.serialize() for post in posts],
        'number_of_pages': number_of_pages
        }          
    return JsonResponse(answer)



def profile(request, user_id):
    profile = User.objects.get(pk=user_id)
    followers = profile.count_followers()
    following = profile.count_following()
    name = profile.username
    followers_list = profile.followers.all()
    is_followed = False
    if request.user is not None and request.user in followers_list:
        is_followed = True
    
    follow ={
        'name': name,
        'followers': followers,
        'following': following,
        'is_followed': is_followed        
    }
    return JsonResponse(follow)  


@csrf_exempt
@login_required
def follow(request):
    # Method must be POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
   
    data = json.loads(request.body)
    user_id = data.get('user_id',)
    user = User.objects.get(pk=user_id)
    followers_list = user.followers.all()
    follower = request.user

    if follower in followers_list:
        user.followers.remove(follower)
        user.save()
        return JsonResponse({"message": "Remove from followers successfully."}, status=201)
    else:
        user.followers.add(follower)
        user.save()
        return JsonResponse({"message": "Add to followers successfully."}, status=201)
    
    

@csrf_exempt
@login_required
def save_edit(request, post_id):

    # Query for requested post
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Edit text
    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("text") is not None:
            post.text = data["text"]
        post.save()
        return JsonResponse({"message": "Post edited successfully."}, status=201)

    # Post must be via PUT
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


@csrf_exempt
@login_required
def post_like(request, post_id):

    # Query for requested post
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Edit text
    if request.method == "PUT":
        liker = request.user
        likers = post.likes.all()
        data = json.loads(request.body)
        #liker = data["liker"]
        #liker = User.objects.get(pk=liker)
        if not liker in likers:
            post.likes.add(data["liker"])
        else:
            post.likes.remove(data["liker"])
        
        post.save()
        return JsonResponse({"message": "Successfully liked."}, status=201)

    # Post must be via PUT
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)

