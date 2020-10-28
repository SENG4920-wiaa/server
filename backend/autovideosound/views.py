import os
from time import time
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
import requests 
from bs4 import BeautifulSoup
import json

class UploadView(APIView):
  def post(self, request):
    video = request.data['video']
    video_key = str(int(time())) + '_' + video.__str__()
    path = default_storage.save(video_key, ContentFile(video.read()))
    return Response(video_key, status=status.HTTP_201_CREATED)

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