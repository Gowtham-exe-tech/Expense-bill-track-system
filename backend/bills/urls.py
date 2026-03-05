from django.urls import path
from .views import BillUploadView, BillListView, BillDetailView, BillApproveView, BillRejectView

urlpatterns = [
    path('upload/', BillUploadView.as_view(), name='bill-upload'),
    path('', BillListView.as_view(), name='bill-list'),
    path('<int:pk>/', BillDetailView.as_view(), name='bill-detail'),
    path('<int:pk>/approve/', BillApproveView.as_view(), name='bill-approve'),
    path('<int:pk>/reject/', BillRejectView.as_view(), name='bill-reject'),
]
