import os
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

# Monkey patch for SSL bypass in corporate network
original_client = httpx.Client.__init__
def patched_client(self, *args, **kwargs):
    kwargs['verify'] = False
    return original_client(self, *args, **kwargs)
httpx.Client.__init__ = patched_client

original_async_client = httpx.AsyncClient.__init__
def patched_async_client(self, *args, **kwargs):
    kwargs['verify'] = False
    return original_async_client(self, *args, **kwargs)
httpx.AsyncClient.__init__ = patched_async_client

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_ANON_KEY"))

user_id = "bd7a67fd-7330-4b5d-8c75-26cdd2240fab"

# Grant 100 credits
supabase.table("user_credits").insert({"user_id": user_id, "credits": 105}).execute()

# Mark 721655118 as PAID
supabase.table("transactions").update({"status": "PAID"}).eq("order_code", 721655118).execute()
print("Fixed!")
