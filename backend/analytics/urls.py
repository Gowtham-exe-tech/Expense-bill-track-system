from django.urls import path
from .views import AnalyticsView, AIAssistantView

urlpatterns = [
    path('', AnalyticsView.as_view(), name='analytics'),
    path('assistant/', AIAssistantView.as_view(), name='ai-assistant'),
]
