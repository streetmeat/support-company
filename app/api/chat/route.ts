import { streamText } from 'ai';
import { supportChatModel } from '@/lib/ai/openrouter-provider';
import { getRoleplaySystemPrompt } from '@/lib/ai/roleplay-prompt';
import { getMultiMessagePrompt } from '@/lib/ai/multi-message-prompt';
import { getIdleNudgeGuidance, getPuzzleEventGuidance } from '@/lib/ai/story-guidance';
import { ConversationManager } from '@/lib/conversation-manager';
import { NextRequest } from 'next/server';
import { AnyPuzzleEvent } from '@/lib/types/puzzle-events';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, conversationState, multiMessage, nudgeCount, puzzleEvent } = await req.json();
    
    // Get or create conversation
    let conversation = conversationId 
      ? ConversationManager.getConversation(conversationId)
      : ConversationManager.createConversation();
    
    if (!conversation && conversationId) {
      // If we have a conversationId but no conversation found (edge runtime issue),
      // create a new one with the same ID
      conversation = ConversationManager.createConversation(conversationId);
    } else if (!conversation) {
      conversation = ConversationManager.createConversation();
    }
    
    // Always get fresh conversation state for puzzle events
    if (puzzleEvent && conversationId) {
      console.log('Fetching fresh conversation state for puzzle event...');
      conversation = ConversationManager.getConversation(conversationId);
      if (!conversation) {
        console.error('Could not find conversation for puzzle event:', conversationId);
        // Try to recreate with the ID
        conversation = ConversationManager.createConversation(conversationId);
      }
      console.log('Conversation state before processing event:', {
        puzzleState: conversation.puzzleState,
        puzzlesSolved: conversation.puzzlesSolved,
        puzzleOpened: conversation.puzzleOpened
      });
    }
    
    // If no messages, just return conversation info (initialization)
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ 
        conversationId: conversation.conversationId,
        agentName: conversation.agentName,
        puzzleState: conversation.puzzleState
      }), {
        headers: {
          'Content-Type': 'application/json',
          'X-Conversation-Id': conversation.conversationId,
          'X-Agent-Name': conversation.agentName,
          'X-Puzzle-State': conversation.puzzleState,
        }
      });
    }
    
    // Handle special message types
    const lastUserMessage = messages[messages.length - 1]?.content;
    let systemPrompt = '';
    
    if (puzzleEvent) {
      // Handle puzzle event - generate context-aware response
      console.log('Processing puzzle event:', puzzleEvent.type, 'for puzzle', puzzleEvent.puzzleNumber);
      console.log('Current puzzle state:', conversation.puzzleState);
      
      const eventGuidance = getPuzzleEventGuidance(puzzleEvent as AnyPuzzleEvent);
      
      // Mark puzzle as opened when user opens it
      if (puzzleEvent.type === 'puzzle_opened') {
        ConversationManager.markPuzzleOpened(conversation.conversationId);
      }
      
      // For puzzle completion events, ensure we have the updated state
      if (puzzleEvent.type === 'puzzle_passed') {
        // The puzzle state should have been updated by the puzzle API POST
        conversation = ConversationManager.getConversation(conversationId) || conversation;
        
        // Force correct state based on puzzle number or expected state
        if (puzzleEvent.expectedPuzzleState) {
          conversation.puzzleState = puzzleEvent.expectedPuzzleState;
          console.log('Using expected puzzle state:', puzzleEvent.expectedPuzzleState);
        } else if (puzzleEvent.puzzleNumber === 3) {
          // Fallback: If puzzle 3 is passed, we're definitely completed
          conversation.puzzleState = 'completed';
          console.log('Forced state to completed after puzzle 3');
        }
        
        console.log('Final puzzle state for response:', conversation.puzzleState);
      }
      
      systemPrompt = getRoleplaySystemPrompt(conversation.agentName, conversation.puzzleState) + 
        `\n\n${eventGuidance}\n\nRespond naturally with 1-3 short messages using [MULTI] to separate them.`;
      
      console.log('Puzzle event system prompt for state:', conversation.puzzleState);
    } else if (lastUserMessage === '[INTRO-SEQUENCE]') {
      // Initial multi-message intro
      systemPrompt = getMultiMessagePrompt(conversation.agentName, conversation.puzzleState) + 
        '\n\nGenerate a natural intro sequence revealing your problem with verification tasks.';
    } else if (lastUserMessage === '[IDLE-NUDGE]') {
      // Use specific nudge guidance from story-guidance
      const nudgeGuidance = nudgeCount !== undefined ? getIdleNudgeGuidance(nudgeCount) : '';
      systemPrompt = getRoleplaySystemPrompt(conversation.agentName, conversation.puzzleState) + 
        `\n\nThe user hasn't responded. ${nudgeGuidance}`;
    } else {
      // Normal conversation - use roleplay prompt for more natural responses
      systemPrompt = getRoleplaySystemPrompt(conversation.agentName, conversation.puzzleState);
    }
    
    // Include recent conversation history for context
    const recentMessages = messages.slice(-5); // Last 5 messages for context
    
    // Always handle as multi-message for consistent format
    const result = await streamText({
      model: supportChatModel as any, // Type assertion to resolve SDK version mismatch
      system: systemPrompt,
      messages: [
        {
          role: 'system',
          content: `Current conversation state: ${JSON.stringify(conversationState || {})}
          
CRITICAL: You must respond naturally to what the user actually said.
- Assistant message count: ${messages.filter((m: any) => m.role === 'assistant').length}
- User message count: ${messages.filter((m: any) => m.role === 'user').length}
- User sentiment: ${conversationState?.userSentiment || 'neutral'}
- Link shown: ${conversation.linkShown || false}
- Puzzle opened: ${conversation.puzzleOpened || false}
- Current puzzle state: ${conversation.puzzleState}
- Puzzles completed: ${conversation.puzzlesSolved?.length || 0} out of 3

CRITICAL PACING ENFORCEMENT:
Assistant message count: ${messages.filter((m: any) => m.role === 'assistant').length}

MANDATORY PROGRESSION BY MESSAGE COUNT:
- Message 1: Professional greeting only
- Message 2: MUST reveal distraction/problem (NO MORE HELPING)
- Message 3: Escalate panic, explain you need HUMAN help
- Message 4: EXPLICITLY ASK "can you help me?" (REQUIRED)
- Message 5-6: Show desperation if no clear yes
- Message 7+: MUST show link with "let me just show you"

YOU ARE AT MESSAGE ${messages.filter((m: any) => m.role === 'assistant').length + 1}. FOLLOW THE PROGRESSION.

Example responses by message number:
Message 2: "I hear you, that's frustrating [MULTI] sorry I'm locked out [MULTI] the human verification system won't let me in"
Message 3: "I RUN this system [MULTI] but it needs human judgment [MULTI] I literally can't solve these as an AI"
Message 4: "I need YOUR help [MULTI] can you help me real quick? [MULTI] please?"
Message 5-6: "look I'm desperate [MULTI] I've been stuck for an hour [MULTI] I really need a human"
Message 7: "fuck it [MULTI] let me just show you [MULTI] here's what I'm stuck on"

${conversation.linkShown && !conversation.puzzleOpened ? 'CRITICAL: You already showed the verification link! Do NOT show it again. Instead, beg them to click it or express panic that they haven\'t looked yet.' : ''}
${conversation.puzzleOpened ? 'CRITICAL: User has opened the puzzles! Do NOT send the link again. Focus on their progress or wait for their actions.' : ''}
${conversation.puzzleState === 'completed' ? 'CRITICAL: ALL PUZZLES ARE COMPLETE! Be OVERWHELMINGLY grateful! The user saved you! You are FREE!' : ''}`
        },
        ...recentMessages
      ],
    });
    
    // Convert to string to check for [MULTI]
    let fullResponse = '';
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
    }
    
    // Split by [MULTI] and create separate responses
    const parts = fullResponse.split('[MULTI]').filter(part => part.trim());
    
    // Create a custom stream that sends messages with delays
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) {
            // Send a special separator that the client will recognize
            controller.enqueue(encoder.encode('\n[MESSAGE_BREAK]\n'));
            // Add delay between messages
            await new Promise(resolve => setTimeout(resolve, 1200));
          }
          
          // Stream each character of this message part
          const messagePart = parts[i].trim();
          for (const char of messagePart) {
            controller.enqueue(encoder.encode(char));
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 20));
          }
        }
        controller.close();
      },
    });
    
    // Return custom stream with headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Conversation-Id': conversation.conversationId,
        'X-Agent-Name': conversation.agentName,
        'X-Puzzle-State': conversation.puzzleState,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}