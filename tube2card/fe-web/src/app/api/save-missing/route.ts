import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { deckId, mindmap, quizzes, token } = await req.json();
    
    if (!token || !deckId) {
      return NextResponse.json({ error: 'Unauthorized or missing deckId' }, { status: 401 });
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
  } catch (error: any) {
    console.error('Save missing error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
