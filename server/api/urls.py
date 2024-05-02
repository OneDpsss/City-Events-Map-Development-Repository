from django.urls import path, include
from .views import NewsView, EventsView
from drf_spectacular.views import SpectacularSwaggerView

app_name = 'api'

urlpatterns = [
    path('', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('auth/', include('djoser.urls.jwt')),
    path('news/', NewsView().as_view(), name='news'),
    path('events/', EventsView().as_view(), name='events'),
]
