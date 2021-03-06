import os
from time import time
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.parsers import FileUploadParser
import requests 
from bs4 import BeautifulSoup
import json

from google.cloud import videointelligence
from google.cloud.videointelligence import enums
from google.protobuf.json_format import MessageToDict

from wordfreq import zipf_frequency

import moviepy.editor as editor

class UploadView(APIView):
    parser_classes = [FileUploadParser]

    def post(self, request, filename):
        video = request.data['file']
 
        video_key = str(int(time())) + '_' + video.__str__()
        path = default_storage.save(video_key, ContentFile(video.read()))

        return Response(video_key, status=status.HTTP_201_CREATED)

#   def start_aws_analysis(self, video_key):
#     put_url = json.loads(requests.get(
#       f'https://dlqyv3dixh.execute-api.ap-southeast-2.amazonaws.com/test/geturl?fileName={video_key}'
#     ).text)['url']

#     with open(os.path.join(settings.MEDIA_ROOT, video_key), 'rb') as f:
#       response = requests.put(put_url, data=f.read())

class LabelView(APIView):
    parser_classes = [FileUploadParser]

    def put(self, request, filename, format=None):
        file_obj = request.data['file']

        # self.implicit()
        labels = self.analyze_labels_file(file_obj)

        return Response(labels) 

    def implicit(self):
        from google.cloud import storage

        # If you don't specify credentials when constructing the client, the
        # client library will look for credentials in the environment.
        storage_client = storage.Client()

        # Make an authenticated API request
        buckets = list(storage_client.list_buckets())
        print(buckets)

    def analyze_labels_file(self, file):
        """Detect labels given a file path."""
        video_client = videointelligence.VideoIntelligenceServiceClient()
        features = [videointelligence.enums.Feature.LABEL_DETECTION]

        # read the file object
        input_content = file.read()

        operation = video_client.annotate_video(
            features=features, input_content=input_content
        )
        print("\nProcessing video for label annotations:")

        result = operation.result(timeout=90)
        print("\nFinished processing.")

        # Process video/segment level label annotations
        segment_labels = result.annotation_results[0].segment_label_annotations
        for i, segment_label in enumerate(segment_labels):
            print("Video label description: {}".format(segment_label.entity.description))
            for category_entity in segment_label.category_entities:
                print(
                    "\tLabel category description: {}".format(category_entity.description)
                )

            for i, segment in enumerate(segment_label.segments):
                start_time = (
                    segment.segment.start_time_offset.seconds
                    + segment.segment.start_time_offset.nanos / 1e9
                )
                end_time = (
                    segment.segment.end_time_offset.seconds
                    + segment.segment.end_time_offset.nanos / 1e9
                )
                positions = "{}s to {}s".format(start_time, end_time)
                confidence = segment.confidence
                print("\tSegment {}: {}".format(i, positions))
                print("\tConfidence: {}".format(confidence))
            print("\n")

        return MessageToDict(result, preserving_proto_field_name = True)

class TranscriptView(APIView):
    parser_classes = [FileUploadParser]

    def put(self, request, filename, format=None):
        file_obj = request.data['file']
        transcript = self.speech_transcription(file_obj)

        return Response(transcript) 

    def speech_transcription(self, file):
        """Transcribe speech from a video stored on GCS."""
        from google.cloud import videointelligence

        video_client = videointelligence.VideoIntelligenceServiceClient()
        features = [videointelligence.enums.Feature.SPEECH_TRANSCRIPTION]

        config = videointelligence.types.SpeechTranscriptionConfig(
            language_code="en-US", enable_automatic_punctuation=True
        )
        video_context = videointelligence.types.VideoContext(
            speech_transcription_config=config
        )

        # read the file object
        input_content = file.read()

        operation = video_client.annotate_video(
            input_content=input_content, features=features, video_context=video_context
        )

        print("\nProcessing video for speech transcription.")

        result = operation.result(timeout=600)

        # There is only one annotation_result since only
        # one video is processed.
        annotation_results = result.annotation_results[0]
        for speech_transcription in annotation_results.speech_transcriptions:

            # The number of alternatives for each transcription is limited by
            # SpeechTranscriptionConfig.max_alternatives.
            # Each alternative is a different possible transcription
            # and has its own confidence score.
            for alternative in speech_transcription.alternatives:
                print("Alternative level information:")

                print("Transcript: {}".format(alternative.transcript))
                print("Confidence: {}\n".format(alternative.confidence))

                print("Word level information:")
                for word_info in alternative.words:
                    word = word_info.word
                    start_time = word_info.start_time
                    end_time = word_info.end_time
                    print(
                        "\t{}s - {}s: {}".format(
                            start_time.seconds + start_time.nanos * 1e-9,
                            end_time.seconds + end_time.nanos * 1e-9,
                            word,
                        )
                    )

        return MessageToDict(result, preserving_proto_field_name = True)

class FreqViewSet(viewsets.GenericViewSet):
  def list(self, request):
      keyword = request.query_params.get('keyword', None)
      frequency = zipf_frequency('zipf', 'en')

      return Response({"frequency": frequency})

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

class CompiledView(APIView):
    def post(self, request, filename):
        # Parse JSON data
        if 'music' in request.data: 
            music_url = request.data['music']['url']
            if 'start' in request.data['music']: music_start = request.data['music']['start']
            else: music_start = 0
            if 'volume' in request.data['music']: music_volume = request.data['music']['volume']/2
            else: music_volume = 1
        else: music_url = None
        effects = []
        if 'effects' in request.data:
            for n, e in enumerate(request.data['effects']):
                effect = {}
                effect['url'] = request.data['effects'][n]['url']
                if 'start' in request.data['effects'][n]: effect['start'] = request.data['effects'][n]['start']
                else: effect['start'] = 0
                if 'volume' in request.data['effects'][n]: effect['volume'] = request.data['effects'][n]['volume']/2
                else: effect['volume'] = 1
                effects.append(effect)

        # Find video file in uploaded files
        try:
            video_path = default_storage.path(filename)
            video = editor.VideoFileClip(video_path).fx(editor.afx.audio_normalize)
        except: return Response('Video file not found. Plase upload using /upload/',
            status=status.HTTP_400_BAD_REQUEST)

        audio_clips = [video.audio] if video.audio else []

        # Process music
        if music_url: 
            music_file = requests.get(music_url).content
            f = open('temp_music.mp3', 'wb')
            f.write(music_file)
            music = editor.AudioFileClip('temp_music.mp3')
            if music.duration > video.duration:
                if video.duration + music_start > music.duration: 
                    music_start = music.duration - video.duration
                if music_start < 0: music_start = 0
                music = music.subclip(music_start, music_start + video.duration)
            music = music.volumex(music_volume)
            audio_clips.append(music)

        # Process effects
        def pad_effect(start, effect, duration):
            def pad_effect_frame(times, start=start, effect=effect):
                if type(times) == int: return [0,0]   
                return [effect.get_frame(time-start) if start < time < start+effect.duration else [0,0]
                    for time in times]
            return editor.AudioClip(pad_effect_frame, duration=duration)

        for e in effects:
            effect_file = requests.get(e['url']).content
            open('temp_audio.mp3', 'wb').write(effect_file)
            effect = editor.AudioFileClip('temp_audio.mp3')
            effect = effect.volumex(e['volume'])
            effect = pad_effect(e['start'], effect, video.duration)
            effect.fps = 44100
            # effect.write_audiofile('temp_audio.mp3', fps=44100)
            # effect = editor.AudioFileClip('temp_audio.mp3')
            audio_clips.append(effect)

        # Compose
        composed_audio = editor.CompositeAudioClip(audio_clips)
        composed_video = video.set_audio(composed_audio)
        composed_video.write_videofile('temp_video.mp4')

        response = FileResponse(open('temp_video.mp4', 'rb'))

        try: os.remove('temp_video.mp4')
        except: pass
        try: os.remove('temp_audio.mp3')
        except: pass
        try: os.remove('temp_music.mp3')
        except: pass

        return response
