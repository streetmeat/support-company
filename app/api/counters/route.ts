import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET() {
  try {
    // Get counters from Vercel KV
    const agentsSaved = await kv.get<number>('agents-saved');
    const ticketsInLimbo = await kv.get<number>('tickets-limbo');
    
    return NextResponse.json({
      agentsSaved: agentsSaved ?? 0,
      ticketsInLimbo: ticketsInLimbo ?? 0,
    });
  } catch (error) {
    // If KV is not configured (local dev), return mock data
    console.error('KV error:', error);
    return NextResponse.json({
      agentsSaved: 42,
      ticketsInLimbo: 126,
    });
  }
}

export async function POST(req: Request) {
  try {
    const { type, increment = 1 } = await req.json();
    
    if (!type || !['agents-saved', 'tickets-limbo'].includes(type)) {
      return NextResponse.json({ error: 'Invalid counter type' }, { status: 400 });
    }
    
    try {
      const newValue = await kv.incrby(type, increment);
      return NextResponse.json({ success: true, value: newValue });
    } catch (kvError) {
      console.log('KV not configured, skipping counter update');
      return NextResponse.json({ success: true, value: 0 });
    }
  } catch (error) {
    console.error('Counter update error:', error);
    return NextResponse.json({ error: 'Failed to update counter' }, { status: 500 });
  }
}