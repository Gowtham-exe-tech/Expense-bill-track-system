from django.urls import path

from .views import LoginAPIView, MeAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('me/', MeAPIView.as_view(), name='me'),
]
