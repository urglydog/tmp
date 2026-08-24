import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url, transcript, token, userId } = await req.json();
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // 1. Lưu Document
    const { data: docData, error: docErr } = await supabase.from('documents').insert({
      user_id: userId,
      source_url: url,
      source_type: 'youtube',
      transcript: transcript || 'No transcript provided',
      status: 'TRANSCRIBED'
    }).select().single();

    if (docErr) throw new Error(`Lỗi tạo Document: ${docErr.message}`);

    // 2. Lưu Deck
    const { data: deckData, error: deckErr } = await supabase.from('decks').insert({
      document_id: docData.id,
      user_id: userId,
      title: `Học liệu từ Youtube`
    }).select().single();

    if (deckErr) throw new Error(`Lỗi tạo Deck: ${deckErr.message}`);

    return NextResponse.json({ success: true, documentId: docData.id, deckId: deckData.id });
  } catch (err: any) {
    console.error("Lưu DB lỗi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
