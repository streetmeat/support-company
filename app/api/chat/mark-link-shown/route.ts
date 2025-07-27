import { NextRequest, NextResponse } from 'next/server';
import { ConversationManager } from '@/lib/conversation-manager';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { conversationId } = await req.json();
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    
    ConversationManager.markLinkShown(conversationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark link shown error:', error);
    return NextResponse.json({ error: 'Failed to mark link shown' }, { status: 500 });
  }
}