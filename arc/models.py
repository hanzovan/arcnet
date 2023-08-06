from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    following = models.ManyToManyField('self', blank=True, symmetrical=False, related_name="followers")


class Post(models.Model):
    author = models.ForeignKey(User, related_name='posts', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"On {self.created} - {self.author} wrote: {self.content}"
    
    def serialize(self):
        return {
            'id': self.id,
            'author': self.author.username,
            'author_id': self.author.id,
            'content': self.content,
            'created': self.created.strftime("%b %d %Y, %I:%M %p")
        }


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    reader = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.reader} like {self.post}"