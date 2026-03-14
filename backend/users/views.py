from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegistrationSerializer, MyTokenObtainPairSerializer, UserProfileSerializer
from django.contrib.auth import get_user_model
from restaurant.utils import standardized_response
from restaurant.middleware import log_request

User = get_user_model()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    @log_request
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return standardized_response(
                status.HTTP_201_CREATED, 
                "User registered successfully", 
                UserRegistrationSerializer(user).data
            )
        # Flatten errors for the message
        error_msg = "Validation failed: " + ", ".join([f"{k}: {v[0]}" for k, v in serializer.errors.items()])
        return standardized_response(status.HTTP_400_BAD_REQUEST, error_msg, success=False)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @log_request
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return standardized_response(status.HTTP_200_OK, "Profile retrieved", serializer.data)
