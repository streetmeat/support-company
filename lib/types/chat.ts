import { PuzzleState } from '@/lib/ai/support-prompts';

export interface ConversationState {
  conversationId: string;
  agentName: string;
  puzzleState: PuzzleState;
  puzzlesSolved: string[]; // ['hands', 'fboy', 'cute']
  currentPuzzleType?: 'hands' | 'fboy' | 'cute';
  startedAt: Date;
  lastActivity: Date;
  isAbandoned: boolean;
  puzzleOpened?: boolean; // Track if user has clicked the verification link
  linkShown?: boolean; // Track if we've already shown the link
}

export interface ChatMessage {
  id: string;
  role: 'agent' | 'user' | 'system';
  content: string;
  timestamp: Date;
}

export interface PuzzleResult {
  puzzleType: 'hands' | 'fboy' | 'cute';
  correct: boolean;
  timestamp: Date;
}