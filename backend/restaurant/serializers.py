from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import transaction
from .models import MenuItem, Category, Order, OrderItem, Review
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

User = get_user_model()

# =========================================
# USER REGISTER SERIALIZER - ✅ FIXED PHONE
# =========================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)  # ✅ Stronger
    phone = serializers.CharField(required=False, allow_blank=True, max_length=15)
    confirm_password = serializers.CharField(write_only=True)  # ✅ Password match

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'first_name', 'phone')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():  # ✅ Case insensitive
            raise serializers.ValidationError("Email already registered")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value.lower()

    def validate(self, data):
        # ✅ Password confirmation
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        phone = validated_data.pop('phone', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            password=validated_data['password'],
            phone=phone,
            role='user'
        )
        
        return user

# =========================================
# CATEGORY SERIALIZER - ✅ PERFECT
# =========================================
class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url

# =========================================
# REVIEW SERIALIZER - ✅ NEW
# =========================================
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'username', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'dish']

# =========================================
# MENU ITEM SERIALIZER - ✅ UPDATED
# =========================================
class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = '__all__'

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url

# =========================================
# ORDER ITEM SERIALIZER - ✅ PERFECT
# =========================================
class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'menu_item_image', 'quantity', 'price']

    def get_menu_item_image(self, obj):
        if obj.menu_item:
            if obj.menu_item.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.menu_item.image.url)
                return obj.menu_item.image.url
            return obj.menu_item.image_url
        return None

# =========================================
# ORDER SERIALIZER (READ) - ✅ PERFECT
# =========================================
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(source='order_items', many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'status', 'customer_name',
            'customer_email', 'customer_phone', 'customer_address', 'payment_method', 'payment_id',
            'created_at', 'items'
        ]

# =========================================
# CREATE ORDER SERIALIZER - ✅ DELEGATED TO SERVICE
# =========================================
from .services import create_order_with_items

class CreateOrderSerializer(serializers.ModelSerializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=50,
        write_only=True
    )
    payment_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    customer_email = serializers.EmailField(required=False, allow_null=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'customer_name', 
            'customer_email', 'customer_phone', 'customer_address', 'payment_method', 
            'items', 'payment_id'
        ]
        read_only_fields = ['id', 'order_number', 'total_amount']

    @transaction.atomic
    def create(self, validated_data):
        # Delegate logic to the service layer for consistency
        return create_order_with_items(self.context['request'].user, validated_data)


# =========================================
# CURRENT USER SERIALIZER / ENDPOINT
# =========================================
# Simple serializer for user profile
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'is_staff']

# Endpoint for /api/auth/me/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Return logged-in user's profile
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)