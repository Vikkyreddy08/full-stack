from django.db import models
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings
import uuid

# ==========================================
# CATEGORY MODEL - ✅ PERFECT
# ==========================================
class Category(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)  # Support file uploads
    image_url = models.URLField(blank=True, null=True)  # Support remote URLs

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

# ==========================================
# MENU ITEM MODEL - ✅ PERFECT
# ==========================================
class MenuItem(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)  # Support file uploads
    image_url = models.URLField(blank=True, null=True)  # Support remote URLs
    available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)  # Highlight on homepage
    is_veg = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)
    prep_time = models.CharField(max_length=20, blank=True)  # e.g., "25min"
    
    # Rating Fields
    average_rating = models.FloatField(default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def update_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            self.total_reviews = reviews.count()
            self.average_rating = round(sum(r.rating for r in reviews) / self.total_reviews, 1)
        else:
            self.total_reviews = 0
            self.average_rating = 0.0
        self.save()

    def __str__(self):
        return self.name

# ==========================================
# REVIEW MODEL - ✅ NEW
# ==========================================
class Review(models.Model):
    dish = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['dish', 'user']  # One review per user per dish
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.dish.name} by {self.user.username}"

# ==========================================
# ORDER MODEL - ✅ FIXED FOR SERIALIZER
# ==========================================
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('ONLINE', 'Online Payment'),  # General online
        ('UPI', 'UPI'),
        ('CARD', 'Card'),
        ('NET_BANKING', 'Net Banking'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    order_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # Customer Details - ✅ FIXED: Email optional
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField(blank=True, null=True)  # ✅ Optional
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default='COD'
    )

    payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number}"

    def get_total_items(self):
        return sum(item.quantity for item in self.order_items.all())

# ==========================================
# ORDER ITEM MODEL - ✅ PERFECT
# ==========================================
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='order_items'  # ✅ FIXED: Correct related_name
    )
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ['order', 'menu_item']

    def get_total_price(self):
        return self.quantity * self.price

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"

# ==========================================
# SIGNALS - ✅ SIMPLIFIED
# ==========================================
@receiver(post_save, sender=OrderItem)
@receiver(post_delete, sender=OrderItem)
def update_order_total(sender, instance, **kwargs):
    """Update order total when OrderItems change"""
    order = instance.order
    total = sum(item.get_total_price() for item in order.order_items.all())
    order.total_amount = total
    order.save(update_fields=['total_amount', 'updated_at'])
