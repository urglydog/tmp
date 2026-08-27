import os
import json
import httpx
# Tắt xác thực SSL cho môi trường Local (Bypass Proxy)
# Đã được cấu hình ở OS nên không cần tắt thủ công nữa.
from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from youtube_transcript_api import YouTubeTranscriptApi
import re
import requests
import urllib3
import random
try:
    from payos import PayOS
    from payos.type import PaymentData, ItemData
except ImportError as e:
    print(f"LỖI IMPORT PAYOS: {e}")
    PaymentData = None
    ItemData = None
    PayOS = None

# Tắt cảnh báo InsecureRequestWarning
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Monkey-patch thư viện requests để tự động tắt verify SSL
old_request = requests.Session.request
def new_request(self, method, url, **kwargs):
    kwargs['verify'] = False
    return old_request(self, method, url, **kwargs)
requests.Session.request = new_request

# Monkey-patch httpx để bypass SSL proxy công ty
import httpx
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

# Load env từ file .env
load_dotenv()

app = FastAPI(title="Tube2Card API", description="Chuyển Youtube thành Flashcard/Mindmap")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

# PayOS Setup
PAYOS_CLIENT_ID = os.getenv("PAYOS_CLIENT_ID")
PAYOS_API_KEY = os.getenv("PAYOS_API_KEY")
PAYOS_CHECKSUM_KEY = os.getenv("PAYOS_CHECKSUM_KEY")

print(f"DEBUG - PAYOS_CLIENT_ID: {bool(PAYOS_CLIENT_ID)}")
print(f"DEBUG - PAYOS_API_KEY: {bool(PAYOS_API_KEY)}")
print(f"DEBUG - PAYOS_CHECKSUM_KEY: {bool(PAYOS_CHECKSUM_KEY)}")
print(f"DEBUG - PayOS Module: {bool(PayOS)}")

payos_client = None
if PAYOS_CLIENT_ID and PAYOS_API_KEY and PAYOS_CHECKSUM_KEY and PayOS:
    payos_client = PayOS(
        client_id=PAYOS_CLIENT_ID, 
        api_key=PAYOS_API_KEY, 
        checksum_key=PAYOS_CHECKSUM_KEY
    )
    print("DEBUG - PayOS Client Khởi tạo THÀNH CÔNG")
else:
    print("DEBUG - PayOS Client Khởi tạo THẤT BẠI")

class GenerateRequest(BaseModel):
    url: str
    user_id: str | None = None

def extract_video_id(url: str) -> str:
    """Trích xuất Video ID từ URL Youtube (hỗ trợ nhiều định dạng)"""
    pattern = r'(?:v=|\/)([0-9A-Za-z_-]{11}).*'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    raise ValueError("Không tìm thấy Video ID hợp lệ từ URL cung cấp.")

def fetch_transcript(video_id: str) -> str:
    """Lấy phụ đề từ Youtube và nối lại thành đoạn văn"""
    try:
        # Xử lý Cookie thủ công nếu có để vượt rào chặn IP
        import os, requests
        raw_cookie = os.getenv("YOUTUBE_RAW_COOKIE")
        session = None
        if raw_cookie:
            session = requests.Session()
            # Giả lập danh tính trình duyệt Chrome thật để đi kèm với Cookie
            session.headers.update({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9,vi;q=0.8"
            })
            for cookie_item in raw_cookie.split(";"):
                cookie_item = cookie_item.strip()
                if "=" in cookie_item:
                    key, val = cookie_item.split("=", 1)
                    session.cookies.set(key, val, domain=".youtube.com")
                    
        # Khởi tạo API (truyền session chứa cookie vào nếu có)
        api = YouTubeTranscriptApi(http_client=session) if session else YouTubeTranscriptApi()
        # Lấy danh sách phụ đề có sẵn
        transcript_list = api.list(video_id)
        # Ưu tiên lấy tiếng Việt, dự phòng tiếng Anh
        try:
            transcript = transcript_list.find_transcript(['vi'])
        except:
            transcript = transcript_list.find_transcript(['en'])
            
        # Lấy nội dung text
        data = transcript.fetch()
        text = ' '.join([t['text'] for t in data])
        return text
    except Exception as e:
        raise ValueError(f"Không thể lấy phụ đề. Lỗi chi tiết: {str(e)}")

async def generate_flashcards_gemini(transcript: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    if not api_key:
        raise HTTPException(status_code=500, detail="Thiếu GEMINI_API_KEY")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    prompt = f"""
    Bạn là một chuyên gia giáo dục. Dựa vào nội dung bài giảng dưới đây, hãy thực hiện 3 việc:
    1. Tạo ra TẤT CẢ các thẻ Flashcard cần thiết (không giới hạn số lượng) để bao quát TOÀN BỘ kiến thức quan trọng. Đừng bỏ sót bất kỳ khái niệm nào.
    2. Tạo một Sơ đồ tư duy (Mindmap) biểu diễn toàn bộ kiến thức bằng cú pháp Mermaid.js.
    3. Tạo 5 câu hỏi trắc nghiệm (Quiz) để kiểm tra kiến thức.
    
    Yêu cầu cho Sơ đồ Tư duy:
    - Dùng `graph TD` hoặc `graph LR`.
    - Phân tầng rõ ràng: Node trung tâm --> Các nhánh chính --> Các chi tiết.
    - TUYỆT ĐỐI KHÔNG dùng thuộc tính classDef hay style phức tạp để tránh lỗi cú pháp. Chỉ dùng kết nối đơn giản A[Tên] --> B[Tên].
    - Tuyệt đối KHÔNG dùng ngoặc kép (") hay các ký tự đặc biệt trong tên Node làm gãy render.

    Yêu cầu cho Trắc nghiệm (Quiz):
    - Mỗi câu hỏi có đúng 4 lựa chọn (options).
    - Chỉ ra `correctAnswerIndex` (từ 0 đến 3).
    - Cung cấp một câu `explanation` ngắn gọn giải thích tại sao đáp án đó đúng.
    
    Trả về ĐÚNG định dạng JSON sau (là một object), không kèm theo markdown block (```json):
    {{
        "flashcards": [
            {{"front": "Câu hỏi", "back": "Trả lời"}}
        ],
        "mindmap": "graph TD\\n  A[Trí tuệ nhân tạo] --> B[Machine Learning]",
        "quizzes": [
            {{
                "question": "Nội dung câu hỏi?",
                "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
                "correctAnswerIndex": 0,
                "explanation": "Giải thích..."
            }}
        ]
    }}
    
    Nội dung bài giảng: {transcript}
    """
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.post(url, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
            text_result = data['candidates'][0]['content']['parts'][0]['text']
            text_result = text_result.replace('```json', '').replace('```', '').strip()
            return json.loads(text_result)
        except Exception as e:
            print(f"[Gemini API Error - generate_flashcards]: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi khi gọi AI Gemini: {str(e)}")

@app.post("/generate")
async def generate_materials(req: GenerateRequest):
    async def event_generator():
        try:
            # Kiểm tra điểm tín dụng nếu có user_id
            if req.user_id and supabase:
                user_credits = supabase.table("user_credits").select("credits").eq("user_id", req.user_id).execute()
                if not user_credits.data or len(user_credits.data) == 0 or user_credits.data[0]["credits"] <= 0:
                    yield f"data: {json.dumps({'error': 'Bạn đã hết lượt tạo (Credits). Vui lòng mua thêm điểm để sử dụng AI.', 'code': 402})}\n\n"
                    return
                    
            # 1. Trích xuất Video ID và Bóc băng Youtube thật
            try:
                yield f"data: {json.dumps({'status': 'extracting_id', 'message': 'Đang trích xuất Video ID...'})}\n\n"
                video_id = extract_video_id(req.url)
                
                yield f"data: {json.dumps({'status': 'fetching_transcript', 'message': 'Đang tải phụ đề Youtube...'})}\n\n"
                transcript = fetch_transcript(video_id)
            except Exception as e:
                yield f"data: {json.dumps({'error': f'Không thể bóc băng Youtube: {str(e)}', 'code': 400})}\n\n"
                return
            
            # 2. Cơ chế Chunking: Chia nhỏ transcript nếu quá dài (vd mỗi chunk 8000 ký tự)
            CHUNK_SIZE = 8000
            chunks = [transcript[i:i + CHUNK_SIZE] for i in range(0, len(transcript), CHUNK_SIZE)]
            
            all_flashcards = []
            mindmap_str = ""
            all_quizzes = []

            # Xử lý từng chunk
            for idx, chunk in enumerate(chunks):
                yield f"data: {json.dumps({'status': 'processing_chunk', 'message': f'AI đang phân tích phần {idx+1}/{len(chunks)}...', 'progress': (idx/len(chunks))*100})}\n\n"
                gemini_result = await generate_flashcards_gemini(chunk)
                all_flashcards.extend(gemini_result.get("flashcards", []))
                all_quizzes.extend(gemini_result.get("quizzes", []))
                
                # Chỉ lấy mindmap từ chunk đầu tiên để tránh xung đột
                if idx == 0:
                    mindmap_str = gemini_result.get("mindmap", "")
                    
            # Trừ điểm sau khi tạo thành công
            if req.user_id and supabase:
                current_credits = user_credits.data[0]["credits"]
                supabase.table("user_credits").update({"credits": current_credits - 1}).eq("user_id", req.user_id).execute()

            # Báo cáo hoàn tất
            final_data = {
                "success": True,
                "data": {
                    "message": "Đã bóc băng, tạo Flashcard, Mindmap và Quiz thành công!",
                    "flashcards": all_flashcards,
                    "mindmap": mindmap_str,
                    "quizzes": all_quizzes,
                    "transcript": transcript
                }
            }
            yield f"data: {json.dumps({'status': 'done', 'result': final_data})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Lỗi hệ thống: {str(e)}', 'code': 500})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

class RegenerateRequest(BaseModel):
    transcript: str

async def generate_missing_gemini(transcript: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    if not api_key:
        raise HTTPException(status_code=500, detail="Thiếu GEMINI_API_KEY")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    prompt = f"""
    Bạn là một chuyên gia giáo dục. Dựa vào nội dung bài giảng dưới đây, hãy thực hiện 2 việc (BỎ QUA PHẦN FLASHCARD):
    1. Tạo một Sơ đồ tư duy (Mindmap) biểu diễn toàn bộ kiến thức bằng cú pháp Mermaid.js.
    2. Tạo 5 câu hỏi trắc nghiệm (Quiz) để kiểm tra kiến thức.
    
    Yêu cầu cho Sơ đồ Tư duy:
    - Dùng `graph TD` hoặc `graph LR`.
    - Phân tầng rõ ràng: Node trung tâm --> Các nhánh chính --> Các chi tiết.
    - TUYỆT ĐỐI KHÔNG dùng thuộc tính classDef hay style phức tạp để tránh lỗi cú pháp. Chỉ dùng kết nối đơn giản A[Tên] --> B[Tên].
    - Tuyệt đối KHÔNG dùng ngoặc kép (") hay các ký tự đặc biệt trong tên Node làm gãy render.

    Yêu cầu cho Trắc nghiệm (Quiz):
    - Mỗi câu hỏi có đúng 4 lựa chọn (options).
    - Chỉ ra `correctAnswerIndex` (từ 0 đến 3).
    - Cung cấp một câu `explanation` ngắn gọn giải thích tại sao đáp án đó đúng.
    
    Trả về ĐÚNG định dạng JSON sau (là một object), không kèm theo markdown block (```json):
    {{
        "mindmap": "graph TD\\n  A[Trí tuệ nhân tạo] --> B[Machine Learning]",
        "quizzes": [
            {{
                "question": "Nội dung câu hỏi?",
                "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
                "correctAnswerIndex": 0,
                "explanation": "Giải thích..."
            }}
        ]
    }}
    
    Nội dung bài giảng: {transcript}
    """
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.post(url, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
            text_result = data['candidates'][0]['content']['parts'][0]['text']
            text_result = text_result.replace('```json', '').replace('```', '').strip()
            return json.loads(text_result)
        except Exception as e:
            print(f"[Gemini API Error - generate_missing]: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi tạo bổ sung từ AI Gemini: {str(e)}")

@app.post("/regenerate")
async def regenerate_missing_materials(req: RegenerateRequest):
    try:
        transcript = req.transcript[:10000]
        gemini_result = await generate_missing_gemini(transcript)

        return {
            "success": True,
            "data": {
                "message": "Đã tạo bổ sung Mindmap và Quiz thành công!",
                "mindmap": gemini_result.get("mindmap", ""),
                "quizzes": gemini_result.get("quizzes", [])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CustomQuizRequest(BaseModel):
    transcript: str
    prompt: str

async def generate_custom_quiz_gemini(transcript: str, user_prompt: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    if not api_key:
        raise HTTPException(status_code=500, detail="Thiếu GEMINI_API_KEY")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    prompt = f"""
    Bạn là một chuyên gia giáo dục. Dựa vào nội dung bài giảng và YÊU CẦU CỦA NGƯỜI DÙNG dưới đây, hãy tạo các câu hỏi trắc nghiệm (Quiz).
    
    YÊU CẦU CỦA NGƯỜI DÙNG: {user_prompt}
    
    Yêu cầu cho Trắc nghiệm (Quiz):
    - Mỗi câu hỏi có đúng 4 lựa chọn (options).
    - Chỉ ra `correctAnswerIndex` (từ 0 đến 3).
    - Cung cấp một câu `explanation` ngắn gọn giải thích tại sao đáp án đó đúng.
    
    Trả về ĐÚNG định dạng JSON sau (là một object), không kèm theo markdown block (```json):
    {{
        "quizzes": [
            {{
                "question": "Nội dung câu hỏi?",
                "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
                "correctAnswerIndex": 0,
                "explanation": "Giải thích..."
            }}
        ]
    }}
    
    Nội dung bài giảng: {transcript}
    """
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.post(url, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
            text_result = data['candidates'][0]['content']['parts'][0]['text']
            text_result = text_result.replace('```json', '').replace('```', '').strip()
            return json.loads(text_result)
        except Exception as e:
            print(f"[Gemini API Error - generate_custom_quiz]: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi tạo custom quiz từ AI Gemini: {str(e)}")

@app.post("/regenerate-custom")
async def regenerate_custom(req: CustomQuizRequest):
    try:
        # Lấy 10,000 ký tự đầu cho custom prompt (để tránh vượt quá token nếu cần)
        transcript = req.transcript[:10000] 
        gemini_result = await generate_custom_quiz_gemini(transcript, req.prompt)

        return {
            "success": True,
            "data": {
                "message": "Đã tạo custom quiz thành công!",
                "quizzes": gemini_result.get("quizzes", [])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CreatePaymentRequest(BaseModel):
    user_id: str
    plan_type: str # 'pro' or 'premium'

@app.post("/create-payment-link")
async def create_payment_link(req: CreatePaymentRequest, origin: str = Header(None)):
    if not payos_client:
        raise HTTPException(status_code=500, detail="PayOS chưa được cấu hình. Vui lòng thêm PAYOS_API_KEY vào biến môi trường.")
        
    order_code = random.randint(100000, 999999999)
    
    if req.plan_type == 'pro':
        amount = 49000
        credits_added = 100
        desc = "Tube2Card Pro"
    elif req.plan_type == 'premium':
        amount = 99000
        credits_added = 300
        desc = "Tube2Card Premium"
    else:
        raise HTTPException(status_code=400, detail="Gói không hợp lệ")

    # Lưu transaction vào Supabase
    if supabase:
        import time
        max_retries = 3
        for attempt in range(max_retries):
            try:
                supabase.table("transactions").insert({
                    "order_code": order_code,
                    "user_id": req.user_id,
                    "amount": amount,
                    "credits_added": credits_added,
                    "status": "PENDING"
                }).execute()
                break # Thành công thì thoát vòng lặp
            except Exception as db_err:
                print(f"[Supabase DB Error - Lần {attempt + 1}]: {db_err}")
                if attempt == max_retries - 1:
                    raise HTTPException(status_code=500, detail=f"Lỗi kết nối CSDL: {str(db_err)}. Vui lòng thử lại.")
                time.sleep(1) # Đợi 1 giây rồi thử lại
    frontend_url = origin if origin else os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    payment_data = PaymentData(
        orderCode=order_code,
        amount=amount,
        description=f"Nap {credits_added} point",
        items=[ItemData(name=desc, quantity=1, price=amount)],
        cancelUrl=f"{frontend_url}/pricing?status=cancel",
        returnUrl=f"{frontend_url}/pricing?status=success"
    )
    
    try:
        payment_link = payos_client.createPaymentLink(paymentData=payment_data)
        return {"success": True, "checkoutUrl": payment_link.checkoutUrl}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import Request
@app.post("/webhook/payos")
async def payos_webhook(request: Request):
    body = await request.json()
    try:
        # Cập nhật DB khi PayOS báo thanh toán thành công
        data = body.get("data", {})
        order_code = data.get("orderCode")
        code = body.get("code")
        
        if code == "00" and order_code:
            if supabase:
                tx = supabase.table("transactions").select("*").eq("order_code", order_code).execute()
                if tx.data and len(tx.data) > 0 and tx.data[0]["status"] == "PENDING":
                    user_id = tx.data[0]["user_id"]
                    credits_added = tx.data[0]["credits_added"]
                    
                    # 1. Update trạng thái
                    supabase.table("transactions").update({"status": "PAID"}).eq("order_code", order_code).execute()
                    
                    # 2. Cộng điểm
                    user_credits = supabase.table("user_credits").select("credits").eq("user_id", user_id).execute()
                    if user_credits.data and len(user_credits.data) > 0:
                        new_credits = user_credits.data[0]["credits"] + credits_added
                        supabase.table("user_credits").update({"credits": new_credits}).eq("user_id", user_id).execute()
                    else:
                        supabase.table("user_credits").insert({"user_id": user_id, "credits": 5 + credits_added}).execute()
            
            return {"success": True}
        return {"success": False, "message": "Ignored"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"success": False}

@app.get("/verify-payment/{order_code}")
async def verify_payment(order_code: int):
    if not payos_client:
        return {"success": False, "detail": "PayOS chưa được cấu hình"}
    try:
        # Gọi API PayOS kiểm tra trạng thái đơn hàng
        payment_info = payos_client.getPaymentLinkInformation(order_code)
        if supabase:
            tx = supabase.table("transactions").select("*").eq("order_code", order_code).execute()
            if tx.data and len(tx.data) > 0:
                current_status = tx.data[0]["status"]
                user_id = tx.data[0]["user_id"]
                credits_added = tx.data[0]["credits_added"]
                
                # 1. Update trạng thái (Dù là PAID, CANCELLED, hay gì thì cũng update theo PayOS)
                if current_status != payment_info.status:
                    supabase.table("transactions").update({"status": payment_info.status}).eq("order_code", order_code).execute()
                
                # 2. Chỉ cộng điểm nếu trạng thái chuyển thành PAID và trước đó chưa PAID
                if payment_info.status == "PAID" and current_status != "PAID":
                    user_credits = supabase.table("user_credits").select("credits").eq("user_id", user_id).execute()
                    if user_credits.data and len(user_credits.data) > 0:
                        new_credits = user_credits.data[0]["credits"] + credits_added
                        supabase.table("user_credits").update({"credits": new_credits}).eq("user_id", user_id).execute()
                    else:
                        supabase.table("user_credits").insert({"user_id": user_id, "credits": 5 + credits_added}).execute()
        
        return {"success": True, "status": payment_info.status}
    except Exception as e:
        print(f"Verify error: {e}")
        return {"success": False, "detail": str(e)}

# --- PHASE 3: KIẾN TRÚC MỚI (TÁCH BIỆT BÓC BĂNG & SINH THẺ) ---

class ProcessDocumentRequest(BaseModel):
    url: str
    user_id: str | None = None

@app.post("/process-document")
async def process_document(req: ProcessDocumentRequest):
    async def event_generator():
        try:
            yield f"data: {json.dumps({'status': 'extracting_id', 'message': 'Đang phân tích nguồn Video...'})}\n\n"
            # 1. Trích xuất ID
            try:
                video_id = extract_video_id(req.url)
            except Exception as e:
                yield f"data: {json.dumps({'error': f'Không hỗ trợ link này: {str(e)}', 'code': 400})}\n\n"
                return
                
            yield f"data: {json.dumps({'status': 'fetching_transcript', 'message': 'Đang tải phụ đề Youtube...'})}\n\n"
            # 2. Bóc băng
            try:
                transcript = fetch_transcript(video_id)
            except Exception as e:
                yield f"data: {json.dumps({'error': f'Không thể bóc băng Youtube: {str(e)}', 'code': 400})}\n\n"
                return
                
            # 3. Lưu vào Supabase (Bỏ qua RLS bằng cách gọi từ Backend, hoặc Backend chỉ trả về transcript cho FE tự lưu)
            # Hiện tại FE tự gọi /api/save nên ta trả về transcript.
            
            final_data = {
                "success": True,
                "data": {
                    "message": "Đã bóc băng thành công!",
                    "transcript": transcript
                }
            }
            yield f"data: {json.dumps({'status': 'done', 'result': final_data})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': f'Lỗi hệ thống: {str(e)}', 'code': 500})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

class GenerateTaskRequest(BaseModel):
    transcript: str
    task_type: str # 'flashcard', 'mindmap', 'quiz'
    user_id: str | None = None

@app.post("/generate-tasks")
async def generate_tasks(req: GenerateTaskRequest):
    try:
        # Tương lai: Trừ Point/Token ở đây
        if req.task_type not in ['flashcard', 'mindmap', 'quiz']:
            raise HTTPException(status_code=400, detail="Task type không hợp lệ")
            
        transcript = req.transcript[:8000] # Giới hạn xử lý cơ bản
        
        if req.task_type == 'flashcard':
            gemini_result = await generate_flashcards_gemini(transcript)
            return {"success": True, "message": f"Đã sinh Flashcard thành công", "data": {"flashcards": gemini_result.get("flashcards", [])}}
        elif req.task_type == 'mindmap':
            gemini_result = await generate_missing_gemini(transcript)
            return {"success": True, "message": f"Đã sinh Sơ đồ tư duy thành công", "data": {"mindmap": gemini_result.get("mindmap", "")}}
        elif req.task_type == 'quiz':
            gemini_result = await generate_missing_gemini(transcript)
            return {"success": True, "message": f"Đã sinh Trắc nghiệm thành công", "data": {"quizzes": gemini_result.get("quizzes", [])}}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
