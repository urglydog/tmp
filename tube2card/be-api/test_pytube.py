from pytubefix import YouTube
try:
    yt = YouTube('https://www.youtube.com/watch?v=qwPvkhemvHA')
    caption = yt.captions.get_by_language_code('vi')
    if not caption:
        caption = yt.captions.get_by_language_code('en')
    if caption:
        print(caption.generate_srt_captions()[:100])
    else:
        print('No captions')
except Exception as e:
    print('Error:', str(e))

