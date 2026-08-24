import sys
from youtube_transcript_api import YouTubeTranscriptApi
video_id = "TFnJFaWwlbs"
try:
    print("Fetching transcript...")
    api = YouTubeTranscriptApi()
    transcript_list = api.list(video_id)
    try:
        transcript = transcript_list.find_transcript(['vi'])
    except:
        transcript = transcript_list.find_transcript(['en'])
        
    data = transcript.fetch()
    text = ' '.join([t['text'] for t in data])
    print(f"Transcript fetched successfully. Length: {len(text)} characters.")
except Exception as e:
    print(f"Error fetching transcript: {e}")
