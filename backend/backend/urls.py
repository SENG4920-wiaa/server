"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from rest_framework import routers
from autovideosound import views
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url, re_path

router = routers.DefaultRouter()
# router.register(r'users', views.UserViewSet)
# router.register(r'groups', views.GroupViewSet)
router.register(r'music', views.MusicViewSet, basename='music')
router.register(r'effects', views.EffectViewSet, basename='effects')
router.register(r'freq', views.FreqViewSet, basename='freq')


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    re_path(r'^upload/(?P<filename>[^/]+)$', views.UploadView.as_view(), name='upload'),
    re_path(r'^labels/(?P<filename>[^/]+)$', views.LabelView.as_view()),
    re_path(r'^transcript/(?P<filename>[^/]+)$', views.TranscriptView.as_view()),
    re_path(r'^compiled/(?P<filename>[^/]+)$', views.CompiledView.as_view()),
] 
# + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
