import { NextRequest, NextResponse } from 'next/server';
import { ConversationManager } from '@/lib/conversation-manager';
import { kv } from '@vercel/kv';
import puzzleManifest from '@/data/puzzles.json';

export const runtime = 'edge';

// Helper function to get random puzzle images
function getRandomPuzzleImages(puzzleType: 'hands' | 'fboy' | 'cute') {
  const puzzle = puzzleManifest.puzzles[puzzleType];
  if (!puzzle) return null;

  // All puzzles can have multiple correct answers now
  let correctImage;
  if (puzzle.correct.length > 1) {
    // Randomly select one correct answer from the pool
    correctImage = puzzle.correct[Math.floor(Math.random() * puzzle.correct.length)];
  } else {
    // Single correct answer
    correctImage = puzzle.correct[0];
  }
  
  // Get two random incorrect images
  const shuffledIncorrect = [...puzzle.incorrect].sort(() => Math.random() - 0.5);
  const incorrectImages = shuffledIncorrect.slice(0, 2);
  
  // Combine and shuffle all images
  const allImages = [correctImage, ...incorrectImages];
  const shuffled = allImages.sort(() => Math.random() - 0.5);
  
  // Find the correct index after shuffling
  const correctIndex = shuffled.findIndex(img => img.isCorrect);
  
  return {
    images: shuffled,
    correctIndex,
    prompt: puzzle.prompt
  };
}

export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }
    
    console.log('Puzzle API - Looking for conversation:', conversationId);
    
    let conversation = ConversationManager.getConversation(conversationId);
    
    // If conversation not found, create a new one with the provided ID
    // This handles the case where edge runtime might have lost the in-memory state
    if (!conversation) {
      console.log('Conversation not found, creating new one with same ID:', conversationId);
      conversation = ConversationManager.createConversation(conversationId);
    }
    
    const nextPuzzleType = ConversationManager.getNextPuzzleType(conversation);
    if (!nextPuzzleType) {
      return NextResponse.json({ error: 'All puzzles completed' }, { status: 400 });
    }
    
    // Get randomized puzzle data
    const puzzleData = getRandomPuzzleImages(nextPuzzleType);
    if (!puzzleData) {
      return NextResponse.json({ error: 'Failed to load puzzle data' }, { status: 500 });
    }
    
    // Update current puzzle type
    conversation.currentPuzzleType = nextPuzzleType;
    
    return NextResponse.json({
      puzzleType: nextPuzzleType,
      puzzleData: {
        prompt: puzzleData.prompt,
        images: puzzleData.images,
        correctIndex: puzzleData.correctIndex
      },
      puzzleNumber: conversation.puzzlesSolved.length + 1,
      totalPuzzles: 3,
    });
  } catch (error) {
    console.error('Puzzle API error:', error);
    return NextResponse.json({ error: 'Failed to get puzzle' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, puzzleType, correct } = await req.json();
    
    if (!conversationId || !puzzleType || correct === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log('Puzzle POST - Updating state for:', { conversationId, puzzleType, correct });
    
    const conversation = ConversationManager.updatePuzzleState(conversationId, {
      puzzleType,
      correct,
      timestamp: new Date(),
    });
    
    if (!conversation) {
      console.error('Could not find conversation to update:', conversationId);
      return NextResponse.json({ error: 'Invalid conversation' }, { status: 404 });
    }
    
    console.log('Puzzle state after update:', {
      puzzleState: conversation.puzzleState,
      puzzlesSolved: conversation.puzzlesSolved,
      conversationId: conversation.conversationId
    });
    
    // Update counters if puzzle was solved
    if (correct) {
      try {
        await kv.incr('agents-saved');
      } catch (kvError) {
        console.log('KV not configured, skipping counter update');
      }
    }
    
    // Check if all puzzles are complete
    const isComplete = conversation.puzzleState === 'completed';
    
    return NextResponse.json({
      success: true,
      puzzleState: conversation.puzzleState,
      puzzlesSolved: conversation.puzzlesSolved.length,
      isComplete,
    });
  } catch (error) {
    console.error('Puzzle submission error:', error);
    return NextResponse.json({ error: 'Failed to submit puzzle' }, { status: 500 });
  }
}