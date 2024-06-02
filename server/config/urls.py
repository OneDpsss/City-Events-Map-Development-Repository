from django.contrib import admin
from django.urls import path, include
from api.views import index_page
from drf_spectacular.views import SpectacularAPIView

urlpatterns = [
    path('', index_page),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
]
