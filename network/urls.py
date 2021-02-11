from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),


    # API Routes
    path("posts/<str:area>/<int:page_n>", views.posts, name="posts"),    
    path("create", views.create, name="create"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("follow", views.follow, name="follow"),
    path("edit/<int:post_id>", views.save_edit, name="save_edit"),
    path("like/<int:post_id>", views.post_like, name="post_like")
]
