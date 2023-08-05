from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register', views.register, name="register"),
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name="logout"),
    path('compose_post', views.compose_post, name="compose_post"),
    path('get_posts/<int:page_number>', views.get_posts, name="get_posts")
]