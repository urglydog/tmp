import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { deckId, flashcards, mindmap, quizzes, token, userId } = await req.json();
    
    if (!token || !userId || !deckId) {
      return NextResponse.json({ error: 'Unauthorized or Missing Deck ID' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const cardsToInsert: any[] = [];
    
    if (flashcards && Array.isArray(flashcards)) {
      flashcards.forEach((card: any) => {
        cardsToInsert.push({
          deck_id: deckId,
          type: 'flashcard',
          front: card.front,
          back: card.back
        });
      });
    }
    
    if (mindmap) {
      cardsToInsert.push({
        deck_id: deckId,
        type: 'mindmap',
        front: mindmap,
        back: ''
      });
    }

    if (quizzes && Array.isArray(quizzes)) {
      quizzes.forEach((quiz: any) => {
        cardsToInsert.push({
          deck_id: deckId,
          type: 'quiz',
          front: quiz.question,
          back: JSON.stringify({
            options: quiz.options,
            correctAnswerIndex: quiz.correctAnswerIndex,
            explanation: quiz.explanation
          })
        });
      });
    }
    
    if (cardsToInsert.length > 0) {
      const { error: cardsErr } = await supabase.from('cards').insert(cardsToInsert);
      if (cardsErr) throw new Error(`Lỗi tạo Cards: ${cardsErr.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Lưu DB lỗi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
