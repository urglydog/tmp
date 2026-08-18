import yt_dlp
import json
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

ydl_opts = {'skip_download': True, 'quiet': True, 'nocheckcertificate': True}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info('https://www.youtube.com/watch?v=dQw4w9WgXcQ', download=False)
    captions = info.get('automatic_captions', {})
    
    # Check if 'vi' or 'en' exists
    lang = 'vi' if 'vi' in captions else ('en' if 'en' in captions else None)
    if lang:
        json_url = next(f['url'] for f in captions[lang] if f['ext'] == 'json3')
        resp = urllib.request.urlopen(json_url, context=ctx)
        data = json.loads(resp.read())
        
        # Parse JSON3
        text_parts = []
        for event in data.get('events', []):
            if 'segs' in event:
                for seg in event['segs']:
                    text_parts.append(seg.get('utf8', ''))
        text = ''.join(text_parts).replace('\n', ' ')
        print(text[:200])
    else:
        print('No captions found')

