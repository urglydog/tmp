import urllib3; urllib3.disable_warnings(); import requests; old_req = requests.Session.request
def new_req(self, m, u, **kw):
    kw['verify'] = False
    headers = kw.get('headers', {})
    if hasattr(headers, 'copy'):
        headers = headers.copy()
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    kw['headers'] = headers
    return old_req(self, m, u, **kw)
requests.Session.request = new_req
from youtube_transcript_api import YouTubeTranscriptApi
print(YouTubeTranscriptApi().list('dQw4w9WgXcQ').find_transcript(['en']).fetch()[0])
