import { ConversationState, PuzzleResult } from '@/lib/types/chat';
import { PuzzleState } from '@/lib/ai/support-prompts';
import { nanoid } from 'nanoid';

// In-memory store for conversations
// In production, this could be Redis or Vercel KV
const conversations = new Map<string, ConversationState>();

// Agent name pool from PRD
const AGENT_NAMES = ['Tyler', 'Marcus', 'Sarah', 'Ashley', 'Jordan', 'Alex'];

export class ConversationManager {
  static createConversation(existingId?: string): ConversationState {
    const conversationId = existingId || nanoid();
    const agentName = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];
    
    const conversation: ConversationState = {
      conversationId,
      agentName,
      puzzleState: 'pre',
      puzzlesSolved: [],
      startedAt: new Date(),
      lastActivity: new Date(),
      isAbandoned: false,
    };
    
    conversations.set(conversationId, conversation);
    return conversation;
  }
  
  static getConversation(conversationId: string): ConversationState | null {
    console.log('ConversationManager.getConversation called for:', conversationId);
    console.log('Available conversations:', Array.from(conversations.keys()));
    
    const conversation = conversations.get(conversationId);
    if (conversation) {
      console.log('Found conversation with state:', conversation.puzzleState);
      // Update last activity
      conversation.lastActivity = new Date();
      conversations.set(conversationId, conversation);
    } else {
      console.log('Conversation not found');
    }
    return conversation || null;
  }
  
  static markPuzzleOpened(conversationId: string): void {
    const conversation = conversations.get(conversationId);
    if (conversation) {
      conversation.puzzleOpened = true;
      conversations.set(conversationId, conversation);
    }
  }
  
  static markLinkShown(conversationId: string): void {
    const conversation = conversations.get(conversationId);
    if (conversation) {
      conversation.linkShown = true;
      conversations.set(conversationId, conversation);
    }
  }
  
  static updatePuzzleState(conversationId: string, puzzleResult: PuzzleResult): ConversationState | null {
    console.log('ConversationManager.updatePuzzleState called with:', { conversationId, puzzleResult });
    console.log('Current conversations in memory:', Array.from(conversations.keys()));
    
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      console.error('Conversation not found in memory:', conversationId);
      return null;
    }
    
    console.log('Found conversation, current state:', {
      puzzleState: conversation.puzzleState,
      puzzlesSolved: conversation.puzzlesSolved
    });
    
    // Add to solved puzzles
    if (puzzleResult.correct) {
      conversation.puzzlesSolved.push(puzzleResult.puzzleType);
      
      // Update puzzle state based on progress
      if (conversation.puzzlesSolved.length === 1) {
        conversation.puzzleState = 'puzzle1';
      } else if (conversation.puzzlesSolved.length === 2) {
        conversation.puzzleState = 'puzzle2';
      } else if (conversation.puzzlesSolved.length === 3) {
        // All puzzles completed!
        conversation.puzzleState = 'completed';
      }
      
      console.log('Updated puzzle state to:', conversation.puzzleState);
    }
    
    conversation.lastActivity = new Date();
    conversations.set(conversationId, conversation);
    return conversation;
  }
  
  static abandonConversation(conversationId: string): void {
    const conversation = conversations.get(conversationId);
    if (conversation) {
      conversation.isAbandoned = true;
      conversations.set(conversationId, conversation);
    }
  }
  
  static getNextPuzzleType(conversation: ConversationState): 'hands' | 'fboy' | 'cute' | null {
    const puzzleOrder: Array<'hands' | 'fboy' | 'cute'> = ['hands', 'fboy', 'cute'];
    const nextIndex = conversation.puzzlesSolved.length;
    
    if (nextIndex >= puzzleOrder.length) return null;
    return puzzleOrder[nextIndex];
  }
  
  // Clean up old conversations (could be a cron job)
  static cleanup(): void {
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [id, conversation] of conversations.entries()) {
      if (now - conversation.lastActivity.getTime() > ONE_HOUR) {
        conversations.delete(id);
      }
    }
  }
}