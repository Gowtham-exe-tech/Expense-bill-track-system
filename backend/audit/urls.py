from django.urls import path
from .views import AuditTrailListView

urlpatterns = [
    path('<int:bill_id>/', AuditTrailListView.as_view(), name='audit-list'),
]
