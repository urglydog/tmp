import os
from dotenv import load_dotenv
from supabase import create_client, Client
import requests
import urllib3
import httpx

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

old_request = requests.Session.request
def new_request(self, method, url, **kwargs):
    kwargs['verify'] = False
    return old_request(self, method, url, **kwargs)
requests.Session.request = new_request

old_httpx_client_init = httpx.Client.__init__
def new_httpx_client_init(self, *args, **kwargs):
    kwargs['verify'] = False
    old_httpx_client_init(self, *args, **kwargs)
httpx.Client.__init__ = new_httpx_client_init

old_httpx_async_client_init = httpx.AsyncClient.__init__
def new_httpx_async_client_init(self, *args, **kwargs):
    kwargs['verify'] = False
    old_httpx_async_client_init(self, *args, **kwargs)
httpx.AsyncClient.__init__ = new_httpx_async_client_init

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Testing supabase query...")
try:
    user_credits = supabase.table("user_credits").select("credits").limit(1).execute()
    print("Supabase data:", user_credits.data)
except Exception as e:
    print("Supabase Error:", e)

from youtube_transcript_api import YouTubeTranscriptApi
print("Testing fetch transcript...")
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
