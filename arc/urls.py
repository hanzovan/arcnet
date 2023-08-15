from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register', views.register, name="register"),
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name="logout"),
    path('compose_post', views.compose_post, name="compose_post"),
    path('get_posts/<int:page_number>', views.get_posts, name="get_posts"),
    path('like_post', views.like_post, name="like_post"),
    path('update_like', views.update_like, name='update_like'),
    path('profile/<int:author_id>', views.profile, name='profile'),
    path('follow_user', views.follow_user, name="follow_user"),
    path('following_page', views.following_page, name="following_page"),
    path('edit_post', views.edit_post, name="edit_post"),
    path('reply', views.reply, name='reply'),
    path('update_replies', views.update_replies, name='update_replies')
]