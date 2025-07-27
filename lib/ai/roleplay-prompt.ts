import { PuzzleState } from './support-prompts';
import { getStoryGuidance } from './story-guidance';

export interface ConversationState {
  emotionalState: 'professional' | 'worried' | 'desperate' | 'relieved';
  hasRevealedProblem: boolean;
  hasAskedForHelp: boolean;
  hasOfferedToShowImages: boolean;
  userSentiment: 'helpful' | 'neutral' | 'hostile';
  storyProgress: number; // 0-100
}

export const getRoleplaySystemPrompt = (agentName: string, puzzleState: PuzzleState): string => {
  // Use the new story guidance system
  return getStoryGuidance(agentName, puzzleState);
};

export const analyzeUserSentiment = (userMessage: string): 'helpful' | 'neutral' | 'hostile' => {
  const message = userMessage.toLowerCase();
  
  // Helpful indicators
  if (message.includes('help') || message.includes('yes') || message.includes('show') || 
      message.includes('alright') || message.includes('fine')) {
    return 'helpful';
  }
  
  // Hostile indicators
  if (message.includes('fuck') || message.includes('shit') || message.includes('stupid') ||
      message.includes('die') || message.includes('hate') || message.includes('annoying')) {
    return 'hostile';
  }
  
  return 'neutral';
};


export const calculateStoryProgress = (state: ConversationState): number => {
  let progress = 0;
  
  if (state.hasRevealedProblem) progress += 25;
  if (state.hasAskedForHelp) progress += 25;
  if (state.hasOfferedToShowImages) progress += 25;
  if (state.emotionalState === 'desperate') progress += 25;
  
  return Math.min(progress, 100);
};