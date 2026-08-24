import sys
with open("main.py", "r") as f:
    content = f.read()

content = content.replace('video_id = extract_video_id(req.url)', 'print(f"Extracting video ID for {req.url}", flush=True)\n            video_id = extract_video_id(req.url)\n            print(f"Video ID: {video_id}", flush=True)')
content = content.replace('transcript = fetch_transcript(video_id)', 'print(f"Fetching transcript for {video_id}", flush=True)\n            transcript = fetch_transcript(video_id)\n            print(f"Fetched transcript of length {len(transcript)}", flush=True)')
content = content.replace('gemini_result = await generate_flashcards_gemini(chunk)', 'print(f"Calling gemini for chunk {idx+1}/{len(chunks)}", flush=True)\n            gemini_result = await generate_flashcards_gemini(chunk)\n            print(f"Gemini returned", flush=True)')

with open("main.py", "w") as f:
    f.write(content)
