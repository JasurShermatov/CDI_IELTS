from django.urls import path
from . import views

urlpatterns = [
    path("request/", views.request_speaking, name="speaking-request"),
    path("request/me/", views.my_speaking_requests, name="speaking-my-requests"),
    # Keep old path as alias for backward compat
    path("my/", views.my_speaking_requests, name="speaking-my-requests-legacy"),
]
