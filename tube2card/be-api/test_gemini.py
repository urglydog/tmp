import os
from dotenv import load_dotenv
import httpx
import asyncio

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

async def test():
    print(f"Key: {api_key[:5]}... Model: {model}")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
    
    async with httpx.AsyncClient(verify=False) as client:
        try:
            print(f"Calling {url}...")
            response = await client.post(url, json=payload, timeout=10.0)
            print("Status code:", response.status_code)
            print("Response:", response.text)
        except Exception as e:
            print("Error:", e)

asyncio.run(test())
