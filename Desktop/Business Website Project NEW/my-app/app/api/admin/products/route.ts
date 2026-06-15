import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').order('id', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Accepts either a single object or an array of objects to upsert
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('/api/admin/products POST body:', body);
    const rows = Array.isArray(body) ? body : [body];
    // Remove undefined/null id fields so inserts work cleanly
    const cleaned = rows.map((r: any) => {
      const copy = { ...r };
      if (typeof copy.id === 'undefined' || copy.id === null) delete copy.id;
      if (typeof copy.tags === 'string') {
        copy.tags = copy.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter(Boolean);
      }
      return copy;
    }).filter((r: any) => Object.keys(r).length > 0);

    if (cleaned.length === 0) {
      return NextResponse.json({ error: 'No valid product data provided' }, { status: 400 });
    }

    console.log('/api/admin/products upsert payload:', cleaned);
    const response = await supabaseAdmin
      .from('products')
      .upsert(cleaned, { onConflict: 'slug', ignoreDuplicates: false })
      .select();
    console.log('/api/admin/products upsert response:', response);

    const { data, error } = response;
    if (error) {
      const errorPayload: any = { message: error.message ?? String(error) };
      for (const key of Object.getOwnPropertyNames(error)) {
        if (key !== 'message') errorPayload[key] = (error as any)[key];
      }
      return NextResponse.json({ error: errorPayload }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (err: any) {
    const message = err?.message || JSON.stringify(err) || String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const update = { ...body };
    delete (update as any).id;
    const { data, error } = await supabaseAdmin.from('products').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || null);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
