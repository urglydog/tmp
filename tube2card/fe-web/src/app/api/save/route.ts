import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url, flashcards, token, userId } = await req.json();
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Khởi tạo Supabase Client ở môi trường Server với Token của User
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

    // 1. Lưu Document
    const { data: docData, error: docErr } = await supabase.from('documents').insert({
      user_id: userId,
      source_url: url,
      source_type: 'youtube',
      transcript: 'Mock transcript used for testing'
    }).select().single();

    if (docErr) throw new Error(`Lỗi tạo Document: ${docErr.message}`);

    // 2. Lưu Deck
    const { data: deckData, error: deckErr } = await supabase.from('decks').insert({
      document_id: docData.id,
      user_id: userId,
      title: `Flashcards từ Youtube`
    }).select().single();

    if (deckErr) throw new Error(`Lỗi tạo Deck: ${deckErr.message}`);

    // 3. Lưu Cards
    const cardsToInsert = flashcards.map((card: any) => ({
      deck_id: deckData.id,
      type: 'flashcard',
      front: card.front,
      back: card.back
    }));
    
    const { error: cardsErr } = await supabase.from('cards').insert(cardsToInsert);
    if (cardsErr) throw new Error(`Lỗi tạo Cards: ${cardsErr.message}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Lưu DB lỗi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
