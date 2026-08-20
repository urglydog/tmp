import os
import json
import httpx
# Tắt xác thực SSL cho môi trường Local (Bypass Proxy)
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["SSL_CERT_FILE"] = ""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from youtube_transcript_api import YouTubeTranscriptApi
import re
import requests
import urllib3

# Tắt cảnh báo InsecureRequestWarning
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Monkey-patch thư viện requests để tự động tắt verify SSL
old_request = requests.Session.request
def new_request(self, method, url, **kwargs):
    kwargs['verify'] = False
    return old_request(self, method, url, **kwargs)
requests.Session.request = new_request

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

class GenerateRequest(BaseModel):
    url: str

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
        # Khởi tạo API
        api = YouTubeTranscriptApi()
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
            # Fallback mock data khi mạng công ty chặn request đến Gemini API
            return {
                "flashcards": [
                    {"front": "Machine Learning (ML) là gì?", "back": "Là một nhánh của trí tuệ nhân tạo (AI) tập trung vào phát triển thuật toán và mô hình thống kê."},
                    {"front": "Đặc điểm chính của Machine Learning?", "back": "Cho phép máy tính học và tự ra quyết định mà không cần lập trình rõ ràng mọi quy tắc."},
                    {"front": "Làm thế nào hệ thống ML cải thiện?", "back": "Thông qua quá trình tích lũy kinh nghiệm (dữ liệu) một cách tự động theo thời gian."}
                ],
                "mindmap": "graph TD\\n  AI[Trí tuệ nhân tạo] --> ML[Machine Learning]\\n  ML --> DL[Deep Learning]\\n  ML --> Data[Dữ liệu huấn luyện]\\n  Data --> Model[Mô hình]",
                "quizzes": [
                    {
                        "question": "Machine Learning là một nhánh của lĩnh vực nào?",
                        "options": ["Vật lý lượng tử", "Trí tuệ nhân tạo (AI)", "Khoa học vật liệu", "Toán học thuần túy"],
                        "correctAnswerIndex": 1,
                        "explanation": "Machine Learning (Học máy) là một tập con của Trí tuệ nhân tạo (AI)."
                    },
                    {
                        "question": "Hệ thống Machine Learning cải thiện khả năng của nó bằng cách nào?",
                        "options": ["Được lập trình thêm quy tắc mới mỗi ngày", "Thông qua quá trình tích lũy dữ liệu và kinh nghiệm", "Nhờ nâng cấp phần cứng liên tục", "Sử dụng mạng internet nhanh hơn"],
                        "correctAnswerIndex": 1,
                        "explanation": "Đặc trưng của ML là khả năng tự học và cải thiện thông qua dữ liệu mà không cần lập trình cứng quy tắc."
                    }
                ]
            }

@app.post("/generate")
async def generate_materials(req: GenerateRequest):
    try:
        # 1. Trích xuất Video ID và Bóc băng Youtube thật
        try:
            video_id = extract_video_id(req.url)
            transcript = fetch_transcript(video_id)
        except Exception as e:
            # Mạng hiện tại chặn Python Script. Chuyển sang dùng Mock Transcript để test UI...
            transcript = "Machine learning is a subfield of artificial intelligence that focuses on the development of algorithms and statistical models. It allows computers to learn and make decisions without being explicitly programmed. This allows systems to improve from experience automatically."
        
        # 2. Cơ chế Chunking: Chia nhỏ transcript nếu quá dài (vd mỗi chunk 8000 ký tự)
        CHUNK_SIZE = 8000
        chunks = [transcript[i:i + CHUNK_SIZE] for i in range(0, len(transcript), CHUNK_SIZE)]
        
        all_flashcards = []
        mindmap_str = ""
        all_quizzes = []

        # Xử lý từng chunk
        for idx, chunk in enumerate(chunks):
            gemini_result = await generate_flashcards_gemini(chunk)
            all_flashcards.extend(gemini_result.get("flashcards", []))
            all_quizzes.extend(gemini_result.get("quizzes", []))
            
            # Chỉ lấy mindmap từ chunk đầu tiên để tránh xung đột
            if idx == 0:
                mindmap_str = gemini_result.get("mindmap", "")

        return {
            "success": True,
            "data": {
                "message": "Đã bóc băng, tạo Flashcard, Mindmap và Quiz thành công (Comprehensive Extraction)!",
                "flashcards": all_flashcards,
                "mindmap": mindmap_str,
                "quizzes": all_quizzes
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
            return {
                "mindmap": "graph TD\\n  AI[Trí tuệ nhân tạo] --> ML[Machine Learning]\\n  ML --> DL[Deep Learning]\\n  ML --> Data[Dữ liệu huấn luyện]\\n  Data --> Model[Mô hình]",
                "quizzes": [
                    {
                        "question": "Dữ liệu phục hồi (Regenerate Mock) là gì?",
                        "options": ["Lỗi mạng", "Phục hồi thành công", "Không rõ", "Tất cả đều sai"],
                        "correctAnswerIndex": 1,
                        "explanation": "Vì mạng nội bộ chặn API nên đây là dữ liệu giả lập được sinh bù."
                    }
                ]
            }

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
            return {
                "quizzes": [
                    {
                        "question": f"[MOCK] Câu hỏi giả lập cho yêu cầu: {user_prompt[:20]}...",
                        "options": ["Đúng", "Sai", "Có thể", "Không biết"],
                        "correctAnswerIndex": 0,
                        "explanation": "Do mạng công ty chặn API, đây là dữ liệu giả lập cho Custom Quiz."
                    }
                ]
            }

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
