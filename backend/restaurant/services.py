import razorpay
import logging
import hmac
import hashlib
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.db import transaction
from .models import Order, OrderItem, MenuItem
from rest_framework.exceptions import ValidationError

from django.utils import timezone
import random
import string

logger = logging.getLogger(__name__)

# Initialize Razorpay Client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

def generate_order_number():
    """Generates a unique order number like BNG-20240314-ABCD"""
    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"BNG-{date_str}-{random_str}"

@transaction.atomic
def create_order_with_items(user, data):
    """
    Atomic transaction to create Order and OrderItems.
    Handles duplicate item IDs by merging quantities.
    """
    customer_name = data.get('customer_name')
    customer_email = data.get('customer_email')
    customer_phone = data.get('customer_phone')
    customer_address = data.get('customer_address')
    payment_method = data.get('payment_method', 'COD')
    items_data = data.get('items', [])
    
    # 1. Merge duplicate item IDs and validate
    merged_items = {}
    for item in items_data:
        m_id = item.get('id') or item.get('menu_item_id')
        qty = int(item.get('quantity', 1))
        if m_id:
            merged_items[m_id] = merged_items.get(m_id, 0) + qty

    if not merged_items:
        raise ValidationError("No valid items provided in the order.")

    # 2. Prepare OrderItems and calculate total
    total_amount = 0
    items_to_create = []
    
    for m_id, qty in merged_items.items():
        try:
            menu_item = MenuItem.objects.get(id=m_id, available=True)
            total_amount += menu_item.price * qty
            
            items_to_create.append(OrderItem(
                menu_item=menu_item,
                quantity=qty,
                price=menu_item.price
            ))
        except MenuItem.DoesNotExist:
            raise ValidationError(f"Menu item with ID {m_id} is unavailable.")
        
    # 3. Create Order object
    order = Order.objects.create(
        user=user,
        order_number=generate_order_number(),
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        customer_address=customer_address,
        payment_method=payment_method,
        total_amount=total_amount,
        status='pending'
    )
    
    # 4. Link items and bulk create
    for item in items_to_create:
        item.order = order
    
    OrderItem.objects.bulk_create(items_to_create)
    return order

def create_razorpay_order_api(amount_in_inr):
    """
    Business logic to create an order in Razorpay.
    """
    try:
        # Razorpay expects amount in paise
        amount_paise = int(float(amount_in_inr) * 100)
        
        data = {
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": "1"
        }
        
        razor_order = razorpay_client.order.create(data=data)
        return razor_order
    except Exception as e:
        logger.error(f"Razorpay order creation error: {str(e)}")
        raise ValidationError(f"Could not initiate payment: {str(e)}")

def verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Verifies the HMAC signature sent by Razorpay using RAZORPAY_SECRET.
    """
    params_dict = {
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'razorpay_signature': razorpay_signature
    }
    
    try:
        razorpay_client.utility.verify_payment_signature(params_dict)
        return True
    except Exception as e:
        logger.error(f"Signature verification failed (HMAC mismatch): {str(e)}")
        return False

def send_order_invoice(order):
    """
    Helper function to send a professional order invoice email
    with HTML + Plain Text fallback.
    """
    try:
        subject = f"Order Confirmation - Bon Gout #{order.order_number}"
        context = {"order": order}
        
        # HTML content
        html_content = render_to_string("email/order_invoice.html", context)
        # Plain text fallback
        text_content = strip_tags(html_content)
        
        # Determine recipient email
        recipient = order.customer_email or order.user.email
        if not recipient:
            logger.warning(f"No email found for order {order.order_number}")
            return False

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=True)  # ✅ Fail silently in production
        
        logger.info(f"Invoice sent for order {order.order_number}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email for order {order.order_number}: {str(e)}")
        return False
