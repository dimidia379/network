# def posts(request, area, page_n):
    

#     if area == "all_posts":
#         allposts = Post.objects.all().order_by("-timestamp")

#     elif area == "following":
#         follower = request.user
#         following_list = []
#         users = User.objects.all()
#         for user in users:
#             user_followers = user.followers.all()
#             if follower in user_followers:
#                 following_list.append(user)
#         allposts = []
#         for following in following_list:
#             allposts += Post.objects.filter(user = following)

#     elif int(area).isdigit():
#         user_id = int(area)
#         posts_non_order = Post.objects.filter(user = user_id)
#         allposts = posts_non_order.order_by("-timestamp").all()
        
#     p = Paginator(allposts, 3)
#     number_of_pages = p.num_pages

#     try:
#         posts = p.page(page_n)
#     except PageNotAnInteger:
#         posts = p.page(1)
#     except EmptyPage:
#         posts = p.page(p.num_pages)
    
#     answer = {
#         'posts': [post.serialize() for post in posts],
#         'number_of_pages': number_of_pages
#         }          
#     return JsonResponse(answer)






    # # API Routes
    # path("posts/<str:area>/<int:page_n>", views.posts, name="posts"),    
    # path("create", views.create, name="create"),
    # path("profile/<int:user_id>", views.profile, name="profile"),
    # path("follow", views.follow, name="follow"),
    # path("edit/<int:post_id>", views.save_edit, name="save_edit"),
    # path("like/<int:post_id>", views.post_like, name="post_like"),







