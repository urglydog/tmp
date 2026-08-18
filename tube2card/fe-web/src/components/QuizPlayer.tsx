'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Clock, Trophy, Target, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface QuizPlayerProps {
  quizzes: Quiz[];
  deckId: string;
}

export default function QuizPlayer({ quizzes, deckId }: QuizPlayerProps) {
  const [view, setView] = useState<'dashboard' | 'playing' | 'review'>('dashboard');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // --- PLAYING STATE ---
  const [playQuizzes, setPlayQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{quizId: string, selected: number, isCorrect: boolean}[]>([]);

  // --- REVIEW STATE ---
  const [reviewAttempt, setReviewAttempt] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchHistory();
  }, [deckId]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: false });
    
    if (data) setAttempts(data);
    setLoadingHistory(false);
  };

  const startQuiz = (mode: 'all' | 'random') => {
    let selected = [...quizzes];
    if (mode === 'random' && quizzes.length > 30) {
      // Bốc ngẫu nhiên 30 câu
      selected = selected.sort(() => 0.5 - Math.random()).slice(0, 30);
    }
    
    setPlayQuizzes(selected);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
    setUserAnswers([]);
    setView('playing');
  };

  const handleSelectOption = (index: number) => {
    if (showResult) return;
    const currentQuiz = playQuizzes[currentIndex];
    setSelectedOption(index);
    setShowResult(true);

    const isCorrect = index === currentQuiz.correctAnswerIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => [
      ...prev,
      { quizId: currentQuiz.id, selected: index, isCorrect }
    ]);
  };

  const saveAttempt = async () => {
    // Chỉ lưu nếu đã làm xong
    const { error } = await supabase.from('quiz_attempts').insert({
      deck_id: deckId,
      score: score,
      total: playQuizzes.length,
      history: userAnswers
    });
    if (!error) {
      fetchHistory(); // Cập nhật lại danh sách lịch sử
    } else {
      alert('Lỗi lưu lịch sử: ' + error.message);
      console.error('Save attempt error:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < playQuizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setFinished(true);
      saveAttempt();
    }
  };

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Không có câu hỏi trắc nghiệm nào.
      </div>
    );
  }

  // ================= VIEW: DASHBOARD =================
  if (view === 'dashboard') {
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Chế độ Luyện đề</h2>
              <p className="text-zinc-400 mt-1">Tổng cộng có {quizzes.length} câu hỏi trong kho.</p>
            </div>
            <div className="flex gap-3">
              {quizzes.length > 30 && (
                <button 
                  onClick={() => startQuiz('random')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700 text-sm font-medium flex items-center gap-2"
                >
                  <Target className="w-4 h-4" /> Luyện ngẫu nhiên (30 câu)
                </button>
              )}
              <button 
                onClick={() => startQuiz('all')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Làm toàn bộ ({quizzes.length} câu)
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-zinc-300 mb-4 border-b border-zinc-800 pb-2">Lịch sử làm bài</h3>
          
          {loadingHistory ? (
            <div className="text-zinc-500 py-8 text-center">Đang tải lịch sử...</div>
          ) : attempts.length === 0 ? (
            <div className="text-zinc-500 py-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800 border-dashed">
              Bạn chưa làm bài test nào. Lịch sử của bạn sẽ xuất hiện ở đây.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {attempts.map(attempt => {
                const date = new Date(attempt.created_at);
                const percentage = Math.round((attempt.score / attempt.total) * 100);
                return (
                  <div 
                    key={attempt.id}
                    onClick={() => { setReviewAttempt(attempt); setView('review'); }}
                    className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-purple-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${percentage >= 80 ? 'bg-green-500/20 text-green-400' : percentage >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {percentage}%
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">Đạt {attempt.score}/{attempt.total} câu</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= VIEW: REVIEW ATTEMPT (CTRL+F FRIENDLY) =================
  if (view === 'review' && reviewAttempt) {
    const history = reviewAttempt.history || [];
    
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Quay lại danh sách
        </button>

        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 mb-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2">Xem lại kết quả</h2>
          <p className="text-lg text-purple-400 font-semibold mb-2">Đạt: {reviewAttempt.score} / {reviewAttempt.total}</p>
          <p className="text-sm text-zinc-500">Màn hình này hiển thị toàn bộ câu hỏi để bạn dễ dàng tìm kiếm (Ctrl + F).</p>
        </div>

        <div className="space-y-8">
          {history.map((ans: any, index: number) => {
            const q = quizzes.find(quiz => quiz.id === ans.quizId);
            if (!q) return null;

            return (
              <div key={ans.quizId} className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  <span className="text-zinc-500 mr-2">Câu {index + 1}:</span>
                  {q.question}
                </h3>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = ans.selected === optIndex;
                    const isCorrect = q.correctAnswerIndex === optIndex;
                    
                    let bgClass = "bg-zinc-950 border-zinc-800 text-zinc-400";
                    if (isCorrect) bgClass = "bg-green-500/20 border-green-500/50 text-green-400 font-medium";
                    else if (isSelected && !isCorrect) bgClass = "bg-red-500/20 border-red-500/50 text-red-400 line-through";

                    return (
                      <div key={optIndex} className={`p-3 rounded-xl border flex items-center justify-between ${bgClass}`}>
                        <span>{String.fromCharCode(65 + optIndex)}. {opt}</span>
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 text-sm">
                  <span className="font-semibold text-zinc-300">Giải thích:</span> <span className="text-zinc-400">{q.explanation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= VIEW: PLAYING =================
  if (view === 'playing') {
    if (finished) {
      const percentage = Math.round((score / playQuizzes.length) * 100);
      return (
        <div className="w-full max-w-2xl mx-auto bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800 p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
          <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-3xl font-black text-white">{percentage}%</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Hoàn thành bài kiểm tra!</h2>
          <p className="text-zinc-400 mb-8">
            Bạn trả lời đúng <span className="text-purple-400 font-bold">{score}</span> / {playQuizzes.length} câu hỏi.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Về danh sách
            </button>
            <button 
              onClick={() => {
                // Fetch the newly created attempt to review immediately
                // In a real app we might pass the local state to review, but here we can just go to dashboard.
                setView('dashboard');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" /> Hoàn tất
            </button>
          </div>
        </div>
      );
    }

    const currentQuiz = playQuizzes[currentIndex];

    return (
      <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => { if(confirm("Bạn có chắc muốn thoát? Kết quả chưa hoàn thành sẽ không được lưu.")) setView('dashboard'); }}
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Thoát ngang
        </button>

        <div className="mb-6 flex justify-between items-center text-sm font-medium">
          <span className="text-zinc-400">Câu hỏi {currentIndex + 1} / {playQuizzes.length}</span>
          <span className="text-purple-400">Điểm hiện tại: {score}</span>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-xl">
          <h3 className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed text-white">
            {currentQuiz.question}
          </h3>

          <div className="flex flex-col gap-3">
            {currentQuiz.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuiz.correctAnswerIndex;
              
              let btnClass = "w-full text-left p-4 rounded-xl border transition-all duration-300 font-medium ";
              
              if (!showResult) {
                btnClass += "border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300";
              } else {
                if (isCorrect) {
                  btnClass += "border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                } else if (isSelected && !isCorrect) {
                  btnClass += "border-red-500 bg-red-500/10 text-red-400 animate-shake";
                } else {
                  btnClass += "border-zinc-800 bg-zinc-900/50 text-zinc-600 opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  disabled={showResult}
                  onClick={() => handleSelectOption(index)}
                  className={btnClass}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="inline-block w-8 font-bold opacity-50">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </span>
                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-8 animate-in fade-in slide-in-from-top-2">
              <div className={`p-4 rounded-xl border ${selectedOption === currentQuiz.correctAnswerIndex ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-zinc-800/50 border-zinc-700 text-zinc-300'}`}>
                <p className="font-semibold mb-1">Giải thích:</p>
                <p className="text-sm opacity-90 leading-relaxed">{currentQuiz.explanation}</p>
              </div>
              
              <button 
                onClick={handleNext}
                className="mt-6 w-full flex items-center justify-center gap-2 p-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
              >
                {currentIndex === playQuizzes.length - 1 ? 'Nộp bài & Xem kết quả' : 'Câu tiếp theo'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}} />
      </div>
    );
  }

  return null;
}
