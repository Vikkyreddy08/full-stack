import logging
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Category, MenuItem, Order, Review
from .serializers import (
    CategorySerializer, 
    MenuItemSerializer, 
    ReviewSerializer, 
    OrderSerializer
)
from .services import (
    create_razorpay_order_api, 
    verify_razorpay_signature, 
    send_order_invoice,
    create_order_with_items
)
from .middleware import log_request, staff_only, admin_only
from .utils import standardized_response, validate_order_payload

logger = logging.getLogger(__name__)

# ==========================================
# ORDER & PAYMENT VIEWS (DRF COMPLIANT)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@log_request
def create_order(request):
    """
    Creates an Order and OrderItems in an atomic transaction.
    Validates payload using helper.
    """
    is_valid, error_msg = validate_order_payload(request.data)
    if not is_valid:
        return standardized_response(status.HTTP_400_BAD_REQUEST, error_msg, success=False)

    try:
        order = create_order_with_items(request.user, request.data)
        return standardized_response(
            status.HTTP_201_CREATED, 
            "Order initiated successfully", 
            {"order_id": order.id, "order_number": order.order_number, "total": order.total_amount}
        )
    except Exception as e:
        logger.error(f"Order creation failed: {str(e)}")
        return standardized_response(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to create order", success=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@log_request
def create_razorpay_order(request):
    """
    Generates a Razorpay Order ID for the frontend.
    """
    amount = request.data.get('amount')
    if not amount:
        return standardized_response(status.HTTP_400_BAD_REQUEST, "Amount is required", success=False)

    try:
        razor_order = create_razorpay_order_api(amount)
        return standardized_response(status.HTTP_201_CREATED, "Razorpay order created", razor_order)
    except Exception as e:
        return standardized_response(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e), success=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@log_request
def verify_razorpay_payment(request):
    """
    Verifies Razorpay signature using HMAC-SHA256 and updates status.
    """
    razorpay_order_id = request.data.get('razorpay_order_id')
    razorpay_payment_id = request.data.get('razorpay_payment_id')
    razorpay_signature = request.data.get('razorpay_signature')
    order_number = request.data.get('order_number')

    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, order_number]):
        return standardized_response(status.HTTP_400_BAD_REQUEST, "Missing parameters (Signature, ID, or Order#)", success=False)

    # Security: HMAC-SHA256 Verification
    is_valid = verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    
    if not is_valid:
        logger.error(f"Payment verification failed for Order #{order_number}")
        return standardized_response(status.HTTP_400_BAD_REQUEST, "Payment spoofing detected (Invalid Signature)", success=False)

    try:
        with transaction.atomic():
            order = Order.objects.get(order_number=order_number)
            order.status = 'confirmed'
            order.payment_id = razorpay_payment_id
            order.save()
            
            # Asynchronous-ready email trigger
            send_order_invoice(order)
            
        return standardized_response(status.HTTP_200_OK, "Payment verified and order confirmed", {
            "order_number": order.order_number,
            "status": order.status
        })
        
    except Order.DoesNotExist:
        logger.error(f"Order #{order_number} not found during verification")
        return standardized_response(status.HTTP_404_NOT_FOUND, "Order not found", success=False)
    except Exception as e:
        logger.error(f"Post-payment processing failed for Order #{order_number}: {str(e)}")
        return standardized_response(status.HTTP_500_INTERNAL_SERVER_ERROR, "Processing failed", success=False)


# ==========================================
# CORE VIEWSETS (STANDARDIZED)
# ==========================================

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return standardized_response(status.HTTP_200_OK, "Categories retrieved", serializer.data)

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # ✅ Filter by featured status if requested
        is_featured = request.query_params.get('is_featured')
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
            
        serializer = self.get_serializer(queryset, many=True)
        return standardized_response(status.HTTP_200_OK, "Menu items retrieved", serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return standardized_response(status.HTTP_200_OK, "Menu item retrieved", serializer.data)

    @action(detail=True, methods=['post'])
    @permission_classes([IsAuthenticated])
    @log_request
    def add_review(self, request, pk=None):
        """
        Add a review to a menu item.
        """
        menu_item = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if user already reviewed
            if Review.objects.filter(dish=menu_item, user=request.user).exists():
                return standardized_response(status.HTTP_400_BAD_REQUEST, "You have already reviewed this item", success=False)
            
            serializer.save(user=request.user, dish=menu_item)
            menu_item.update_rating()
            return standardized_response(status.HTTP_201_CREATED, "Review added successfully", serializer.data)
        
        return standardized_response(status.HTTP_400_BAD_REQUEST, "Invalid review data", serializer.errors, success=False)

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset for viewing orders. 
    Creation is handled by the specialized create_order view above.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') in ['admin', 'employee']:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def get_serializer_class(self):
        return OrderSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return standardized_response(status.HTTP_200_OK, "Orders retrieved", serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return standardized_response(status.HTTP_200_OK, "Order details retrieved", serializer.data)

    @action(detail=True, methods=['post'])
    @method_decorator(staff_only)
    @log_request
    def update_status(self, request, pk=None):
        """
        Staff Only: Update order status manually.
        """
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return standardized_response(status.HTTP_200_OK, f"Status updated to {new_status}")
        return standardized_response(status.HTTP_400_BAD_REQUEST, "Invalid status", success=False)

    @action(detail=True, methods=['post'])
    @method_decorator(staff_only)
    @log_request
    def update_progress(self, request, pk=None):
        """
        Staff Only: Advance order to next logical status.
        """
        order = self.get_object()
        status_flow = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
        
        try:
            current_idx = status_flow.index(order.status)
            if current_idx < len(status_flow) - 1:
                order.status = status_flow[current_idx + 1]
                order.save()
                return standardized_response(status.HTTP_200_OK, f"Order advanced to {order.status}")
            return standardized_response(status.HTTP_400_BAD_REQUEST, "Order is already delivered", success=False)
        except ValueError:
            return standardized_response(status.HTTP_400_BAD_REQUEST, "Cannot advance status from current state", success=False)

    @action(detail=True, methods=['post'])
    @log_request
    def cancel(self, request, pk=None):
        """
        Cancel order (allowed for user if still pending, or staff anytime).
        """
        order = self.get_object()
        is_staff = request.user.is_staff or getattr(request.user, 'role', '') in ['admin', 'employee']
        
        if order.status == 'pending' or is_staff:
            order.status = 'cancelled'
            order.save()
            return standardized_response(status.HTTP_200_OK, "Order cancelled successfully")
        
        return standardized_response(status.HTTP_400_BAD_REQUEST, "Order cannot be cancelled at this stage", success=False)
