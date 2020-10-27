from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
from backend.quickstart.serializers import UserSerializer, GroupSerializer
from rest_framework.response import Response
import requests 
from bs4 import BeautifulSoup
import json

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class EffectViewSet(viewsets.GenericViewSet):
    def list(self, request):
        keyword = request.query_params.get('keyword', None)
        sourceurl = f'https://freesound.org/search/?q={keyword}&f=duration%3A%5B0+TO+3%5D&s=score+desc&advanced=1&g=1'

        source = requests.get(sourceurl).text
        bs = BeautifulSoup(source, 'html.parser')
        tracks = bs.find_all("a", class_="mp3_file")

        urls = []
        for track in tracks:
            url = track['href']
            urls.append(f'https://freesound.org{url}')

        return Response({"tracks": urls})

class MusicViewSet(viewsets.GenericViewSet):
    def list(self, request):
        keyword = request.query_params.get('keyword', None)
        sourceurl = f'https://freemusicarchive.org/search?adv=1&quicksearch={keyword}&&&music-filter-remix-allowed=1'

        source = requests.get(sourceurl).text
        bs = BeautifulSoup(source, 'html.parser')
        tracks = bs.find_all("div", class_="play-item")

        urls = []
        for track in tracks:
            info = json.loads(track['data-track-info'])
            urls.append(info['playbackUrl'])

        return Response({"tracks": urls})