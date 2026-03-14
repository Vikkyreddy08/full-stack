from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# ✅ FIXED: Removed redundant auth registration
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='categories')
router.register(r'menu', views.MenuItemViewSet, basename='menu')
router.register(r'orders', views.OrderViewSet, basename='orders')  # ✅ Handles LIST + DETAIL

urlpatterns = [
    # ✅ Order Creation
    path('orders/create/', views.create_order, name='create_order'),

    # ✅ Razorpay Integration
    path('payments/create/', views.create_razorpay_order, name='create_razorpay_order'),
    path('payments/verify/', views.verify_razorpay_payment, name='verify_razorpay_payment'),
    
    # ✅ Router URLs - ALL endpoints automatically generated
    path('', include(router.urls)),
]
