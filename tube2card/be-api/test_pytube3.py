import ssl
import urllib.request
from pytubefix import YouTube

ssl._create_default_https_context = ssl._create_unverified_context

try:
    yt = YouTube('https://www.youtube.com/watch?v=TFnJFaWwlbs')
    caption = yt.captions.get_by_language_code('vi')
    if not caption:
        caption = yt.captions.get_by_language_code('en')
    if caption:
        print("Caption found!")
        print(caption.generate_srt_captions()[:100])
    else:
        print('No captions')
except Exception as e:
    print('Error:', str(e))
