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
from django.core.paginator import Paginator
import json

from .models import User, Post




def posts(request, area, page_n):
    number_of_pages = p.num_pages

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

    elif int(area).isdigit():
        user_id = int(area)
        posts_non_order = Post.objects.filter(user = user_id)
        allposts = posts_non_order.order_by("-timestamp").all()
        
    p = Paginator(allposts, 3)

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














