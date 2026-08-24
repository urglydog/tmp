import urllib3
import requests
from youtube_transcript_api import YouTubeTranscriptApi

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
old_request = requests.Session.request
def new_request(self, method, url, **kwargs):
    kwargs['verify'] = False
    return old_request(self, method, url, **kwargs)
requests.Session.request = new_request

print("Fetching transcript...")
try:
    api = YouTubeTranscriptApi()
    transcript_list = api.list("TFnJFaWwlbs")
    try:
        transcript = transcript_list.find_transcript(['vi'])
    except:
        transcript = transcript_list.find_transcript(['en'])
        
    data = transcript.fetch()
    text = ' '.join([t['text'] for t in data])
    print(f"Transcript fetched successfully. Length: {len(text)} characters.")
except Exception as e:
    print("Fetch transcript error:", e)
