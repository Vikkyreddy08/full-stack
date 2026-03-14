"""
Django settings for bon_gout project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# ==========================================
# LOAD .ENV FILE (LOCAL DEVELOPMENT ONLY)
# ==========================================
load_dotenv()

# ==========================================
# BASE DIRECTORY
# ==========================================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================
# SECURITY SETTINGS
# ==========================================
# SECRET_KEY from environment or fallback for development
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key-for-development-only')

# DEBUG mode from environment (False by default)
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# ALLOWED_HOSTS from environment or default localhost
ALLOWED_HOSTS = os.getenv(
    'ALLOWED_HOSTS',
    'localhost,127.0.0.1'
).split(',')
if DEBUG:
    ALLOWED_HOSTS.append('*')

# ==========================================
# AUTH CONFIGURATION - CUSTOM USER MODEL
# ==========================================
AUTH_USER_MODEL = 'users.User'

# ==========================================
# APPLICATIONS
# ==========================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'corsheaders',                    
    'rest_framework',                 
    'rest_framework_simplejwt',      

    # Your apps
    'users',
    'restaurant',
]

# ==========================================
# MIDDLEWARE
# ==========================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==========================================
# ROOT CONFIG
# ==========================================
ROOT_URLCONF = 'bon_gout.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bon_gout.wsgi.application'

# ==========================================
# DATABASE (MySQL) FROM ENV VARIABLES
# ==========================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'backend'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}

# ==========================================
# PASSWORD VALIDATION
# ==========================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==========================================
# REST FRAMEWORK
# ==========================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100
}

# ==========================================
# SIMPLE JWT
# ==========================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ROTATE_REFRESH_TOKENS': True,
}

# ==========================================
# CORS CONFIG
# ==========================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ==========================================
# MEDIA FILES
# ==========================================
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ==========================================
# STATIC FILES
# ==========================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']  

# ==========================================
# EMAIL SETTINGS
# ==========================================
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER or 'webmaster@localhost'

# ==========================================
# RAZORPAY KEYS
# ==========================================
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')

# ==========================================
# DEFAULT AUTO FIELD
# ==========================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'