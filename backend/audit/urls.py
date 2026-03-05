from django.urls import path
from .views import AuditTrailListView, AuditTrailAllView

urlpatterns = [
    path('<int:bill_id>/', AuditTrailListView.as_view(), name='audit-list'),
    path('', AuditTrailAllView.as_view(), name='audit-list-all'),
]
