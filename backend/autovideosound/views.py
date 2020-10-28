import os
from time import time
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
import requests 
from bs4 import BeautifulSoup
import json

class UploadView(APIView):
  def post(self, request):
    try:
      video = request.data['video']
      video_key = str(int(time())) + '_' + video.__str__()
      path = default_storage.save(video_key, ContentFile(video.read()))
    except:
      return Response(status=status.HTTP_400_BAD_REQUEST)

    self.start_aws_analysis(video_key)

    return Response(video_key, status=status.HTTP_201_CREATED)

  def start_aws_analysis(self, video_key):
    put_url = json.loads(requests.get(
      f'https://dlqyv3dixh.execute-api.ap-southeast-2.amazonaws.com/test/geturl?fileName={video_key}'
    ).text)['url']

    with open(os.path.join(settings.MEDIA_ROOT, video_key), 'rb') as f:
      response = requests.put(put_url, data=f.read())
    

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