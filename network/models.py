from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    followers = models.ManyToManyField('self', symmetrical=False, blank=True)

    def count_followers(self):
        return self.followers.count()
    
    def count_following(self):
        return User.objects.filter(followers=self).count()

    def __str__(self):
        return self.username


class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="authors", default=None)
    text = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    likes = models.ManyToManyField("User", related_name="likers", default=None, blank=True)

    def count_likes(self):
        return self.likes.count()

    def serialize(self):
        return{            
            "id": self.id,
            "author": self.user.username,
            "author_id": self.user.id,
            "text": self.text,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": [user.id for user in self.likes.all()],
            "count_likes": self.count_likes()
        }

