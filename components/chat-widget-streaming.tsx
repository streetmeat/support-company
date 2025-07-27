'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from 'ai/react';
import { nanoid } from 'nanoid';
import { ConversationState, analyzeUserSentiment } from '@/lib/ai/roleplay-prompt';
import { AnyPuzzleEvent } from '@/lib/types/puzzle-events';

interface ChatWidgetProps {
  onClose: () => void;
  onPuzzleOpen: (puzzleType: string) => void;
  onConversationStart?: (conversationId: string) => void;
}

// Agent names from PRD
const AGENT_NAMES = ['Tyler', 'Marcus', 'Sarah', 'Ashley', 'Jordan', 'Alex'];

// Global instance tracker to prevent multiple mounts
let activeInstance: string | null = null;

export default function ChatWidgetStreaming({ onClose, onPuzzleOpen, onConversationStart }: ChatWidgetProps) {
  const instanceId = useRef(nanoid());
  const [conversationId, setConversationId] = useState<string>('');
  const [agentName] = useState(AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)]);
  const [puzzleState, setPuzzleState] = useState<string>('pre');
  const [showingButton, setShowingButton] = useState(false);
  const [linkMessageId, setLinkMessageId] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [forceShowLink, setForceShowLink] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [puzzleStarted, setPuzzleStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [streamingMessageId, setStreamingMessageId] = useState<string>('');
  const [hasResigned, setHasResigned] = useState(false);
  
  // Track conversation state
  const [conversationState, setConversationState] = useState<ConversationState>({
    emotionalState: 'professional',
    hasRevealedProblem: false,
    hasAskedForHelp: false,
    hasOfferedToShowImages: false,
    userSentiment: 'neutral',
    storyProgress: 0,
  });
  const [linkContext, setLinkContext] = useState<string>(''); // Track context for link
  
  // Idle timer cascade state - moved before handleStreamingResponse
  const idleTimersRef = useRef<NodeJS.Timeout[]>([]);
  const [nudgeCount, setNudgeCount] = useState(0);
  
  // Refs to access latest state in timers
  const messagesRef = useRef<Message[]>([]);
  const conversationIdRef = useRef<string>('');
  const conversationStateRef = useRef<ConversationState>(conversationState);
  
  // Update refs when state changes
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);
  
  useEffect(() => {
    conversationStateRef.current = conversationState;
  }, [conversationState]);
  
  // Clear all idle timers
  const clearIdleTimers = useCallback(() => {
    console.log('Clearing idle timers:', idleTimersRef.current.length);
    idleTimersRef.current.forEach(timer => clearTimeout(timer));
    idleTimersRef.current = [];
  }, []);
  
  // Handle puzzle events from the puzzle container
  const handlePuzzleEvent = useCallback(async (event: AnyPuzzleEvent) => {
    console.log('Chat received puzzle event:', event);
    
    // Clear idle timers when puzzle events happen
    clearIdleTimers();
    
    // Don't send events if still loading or resigned
    if (isLoading || hasResigned) return;
    
    // Send event to chat API to get AI response
    try {
      // Use current state directly, not refs
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages, // Use state directly
          conversationId: conversationId,
          conversationState: conversationState,
          multiMessage: true,
          puzzleEvent: event, // Include the puzzle event
        }),
      });
      
      // Process the streaming response as usual
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader available');
      
      setIsLoading(true);
      let currentMessageId = nanoid();
      setStreamingMessageId(currentMessageId);
      let currentContent = '';
      let messageCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        
        // Check for message break
        if (chunk.includes('[MESSAGE_BREAK]')) {
          // Finalize current message
          const finalContent = currentContent.replace('[MESSAGE_BREAK]', '').trim();
          if (finalContent) {
            const newMessage: Message = {
              id: currentMessageId,
              role: 'assistant',
              content: finalContent,
              createdAt: new Date(),
            };
            setMessages(prev => [...prev, newMessage]);
            
            // Update conversation state
            updateConversationState(finalContent, messageCount, currentMessageId);
            messageCount++;
          }
          
          // Start new message
          currentMessageId = nanoid();
          setStreamingMessageId(currentMessageId);
          currentContent = '';
          setCurrentStreamingMessage('');
        } else {
          // Accumulate content
          currentContent += chunk;
          setCurrentStreamingMessage(currentContent.replace(/\[MESSAGE_BREAK\]/g, ''));
        }
      }
      
      // Add final message if any content remains
      if (currentContent.trim()) {
        const finalMessage: Message = {
          id: currentMessageId,
          role: 'assistant',
          content: currentContent.trim(),
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, finalMessage]);
        messagesRef.current = [...messagesRef.current, finalMessage]; // Update ref too
        // Skip conversation state update for puzzle events - it's handled by the main chat flow
      }
      
      setCurrentStreamingMessage('');
      setStreamingMessageId('');
      
      console.log('Puzzle event response completed, total messages:', messageCount + 1);
    } catch (error) {
      console.error('Error handling puzzle event:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: 'Sorry, I got a bit confused there... where were we?',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasResigned, clearIdleTimers, messages, conversationId, conversationState]);
  
  // Make the handler available to parent component
  useEffect(() => {
    // Store the handler on the window object so parent can access it
    if (typeof window !== 'undefined') {
      (window as any).chatPuzzleEventHandler = handlePuzzleEvent;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).chatPuzzleEventHandler;
      }
    };
  }, [handlePuzzleEvent]);
  
  // Handle streaming response with multi-message support
  const handleStreamingResponse = async (userMessage: string) => {
    setIsLoading(true);
    setCurrentStreamingMessage('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: userMessage === '[IDLE-NUDGE]' 
            ? messagesRef.current // Don't add user message for idle nudges
            : [...messagesRef.current, { role: 'user', content: userMessage, id: nanoid() }],
          conversationId: conversationIdRef.current,
          conversationState: conversationStateRef.current,
          multiMessage: true, // Always true for proper multi-message format
          nudgeCount: userMessage === '[IDLE-NUDGE]' ? nudgeCount : undefined,
        }),
      });
      
      // Get metadata from headers
      const newConversationId = response.headers.get('X-Conversation-Id');
      const newPuzzleState = response.headers.get('X-Puzzle-State');
      
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
        onConversationStart?.(newConversationId);
      }
      if (newPuzzleState) {
        setPuzzleState(newPuzzleState);
      }
      
      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader available');
      
      let currentMessageId = nanoid();
      setStreamingMessageId(currentMessageId);
      let currentContent = '';
      let messageCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        
        // Check for message break
        if (chunk.includes('[MESSAGE_BREAK]')) {
          // Finalize current message
          const finalContent = currentContent.replace('[MESSAGE_BREAK]', '').trim();
          if (finalContent) {
            const newMessage: Message = {
              id: currentMessageId,
              role: 'assistant',
              content: finalContent,
              createdAt: new Date(),
            };
            setMessages(prev => [...prev, newMessage]);
            
            // Update conversation state
            updateConversationState(finalContent, messageCount, currentMessageId);
            messageCount++;
          }
          
          // Start new message
          currentMessageId = nanoid();
          setStreamingMessageId(currentMessageId);
          currentContent = '';
          setCurrentStreamingMessage('');
        } else {
          // Accumulate content
          currentContent += chunk;
          setCurrentStreamingMessage(currentContent.replace(/\[MESSAGE_BREAK\]/g, ''));
        }
      }
      
      // Add final message if any content remains
      if (currentContent.trim()) {
        const finalMessage: Message = {
          id: currentMessageId,
          role: 'assistant',
          content: currentContent.trim(),
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, finalMessage]);
        updateConversationState(currentContent, messageCount, currentMessageId);
      }
      
      setCurrentStreamingMessage('');
      setStreamingMessageId('');
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update conversation state based on message content
  const updateConversationState = (content: string, messageIndex: number, messageId?: string) => {
    const lowerContent = content.toLowerCase();
    const newState = { ...conversationState };
    
    // Track story progression
    if (lowerContent.includes('verification') || lowerContent.includes('tasks') || lowerContent.includes('stuck')) {
      newState.hasRevealedProblem = true;
    }
    
    // Check for human help mentions (more flexible)
    if (lowerContent.includes('help') || lowerContent.includes('need') || 
        lowerContent.includes('stuck') || lowerContent.includes('human') ||
        lowerContent.includes('struggling') || lowerContent.includes('can\'t')) {
      newState.hasAskedForHelp = true;
      newState.emotionalState = 'worried';
    }
    
    // Track emotional escalation - gradual for better storytelling
    const assistantMessageCount = messages.filter(m => m.role === 'assistant').length;
    const userHasResponded = messages.filter(m => m.role === 'user').length > 0;
    
    // Gradual escalation after user response
    if (userHasResponded) {
      if (assistantMessageCount >= 2) {
        newState.hasRevealedProblem = true;
      }
      if (assistantMessageCount >= 3) {
        newState.emotionalState = 'worried';
      }
      if (assistantMessageCount >= 4) {
        newState.hasAskedForHelp = true;
        newState.emotionalState = 'desperate';
      }
    }
    
    // Force link appearance after enough messages
    if (assistantMessageCount >= 6 && !showingButton) {
      newState.hasAskedForHelp = true;
      newState.hasOfferedToShowImages = true;
    }
    
    // Check if this is a message that should show the link (very permissive)
    const shouldShowLink = (
      lowerContent.includes('here') || 
      lowerContent.includes('these') || 
      lowerContent.includes('stuck on') ||
      lowerContent.includes('let me') ||
      lowerContent.includes('what i') ||
      lowerContent.includes('show you') ||
      (lowerContent.includes('thank') && assistantMessageCount > 2) // Grateful response after help offer
    );
    
    setConversationState(newState);
    
    // Check if user has engaged at all (any response shows minimal engagement)
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content?.toLowerCase() || '';
    
    // User shows any engagement (very low bar)
    const userEngaged = userHasResponded && (
      lastUserMessage.length > 0 || // Any response counts
      lastUserMessage.includes('ok') || 
      lastUserMessage.includes('what') ||
      lastUserMessage.includes('?') ||
      lastUserMessage.includes('sure') ||
      lastUserMessage.includes('fine') ||
      lastUserMessage.includes('help')
    );
    
    // Balanced link showing:
    // Show link when narrative has developed AND agent is ready to share
    // Typically around message 4-6 when agent asks for help
    if (!showingButton && !puzzleStarted && !linkMessageId &&
        userHasResponded && newState.hasAskedForHelp && shouldShowLink &&
        assistantMessageCount >= 4) {
      console.log('Setting showing button to true!', { 
        hasRevealedProblem: newState.hasRevealedProblem,
        hasAskedForHelp: newState.hasAskedForHelp, 
        userEngaged, 
        shouldShowLink,
        assistantMessageCount 
      });
      setShowingButton(true);
      setLinkContext(content);
      
      // Set the specific message ID that should show the link
      if (messageId) {
        setLinkMessageId(messageId);
      }
      
      // Mark link as shown in conversation manager
      if (conversationIdRef.current) {
        fetch('/api/chat/mark-link-shown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: conversationIdRef.current }),
        }).catch(console.error);
      }
    }
  };
  
  // Instance management - prevent multiple active chats
  useEffect(() => {
    // If another instance is active, don't initialize this one
    if (activeInstance && activeInstance !== instanceId.current) {
      return;
    }
    
    // Claim this instance as active
    activeInstance = instanceId.current;
    
    // Cleanup on unmount
    return () => {
      if (activeInstance === instanceId.current) {
        activeInstance = null;
      }
      clearIdleTimers();
    };
  }, [clearIdleTimers]);
  
  // Initial greeting ONLY - no auto-anxiety
  useEffect(() => {
    if (!hasGreeted && messages.length === 0 && activeInstance === instanceId.current) {
      const timer = setTimeout(() => {
        const greetingMessage: Message = {
          id: nanoid(),
          role: 'assistant',
          content: `Hi! I'm ${agentName} from Support Company. How can I help you today?`,
          createdAt: new Date(),
        };
        
        setMessages([greetingMessage]);
        setHasGreeted(true);
        // DO NOT auto-trigger ANYTHING - wait for user input or timeout
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [hasGreeted, agentName, messages.length]);
  
  // Auto follow-up with proper cascade timing
  useEffect(() => {
    console.log('Timer effect running', { 
      hasGreeted, 
      messageCount: messages.length, 
      isLoading,
      lastMessageRole: messages[messages.length - 1]?.role 
    });
    
    if (!hasGreeted || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    // Only set timers after assistant messages (not during loading or after user messages)
    if (lastMessage?.role !== 'assistant' || isLoading) return;
    
    // Don't set timers if we're in completed state or already resigned
    if (puzzleState === 'completed' || hasResigned) return;
    
    // Stop spamming after too many messages
    const totalMessages = messages.length;
    const assistantMessageCount = messages.filter(m => m.role === 'assistant').length;
    if (totalMessages > 20 || assistantMessageCount > 10) {
      console.log('Message limit reached, stopping auto-follow-ups');
      setHasResigned(true);
      return;
    }
    
    // Don't set any new timers if we've already started the nudge sequence
    if (nudgeCount > 0 && !isLoading) {
      console.log('Nudge sequence already started, not setting new timers');
      return;
    }
    
    // Clear any existing timers before setting new ones
    clearIdleTimers();
    
    console.log('Setting up idle timers...', { 
      messageCount: messages.length,
      assistantCount: messages.filter(m => m.role === 'assistant').length,
      showingButton 
    });
    
    // Check if user was dismissive
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content?.toLowerCase() || '';
    const userDismissive = lastUserMessage.includes("don't need") || 
                          lastUserMessage.includes("no") || 
                          lastUserMessage.includes("ok") ||
                          lastUserMessage.length < 5;
    
    // Set cascade timers for story progression
    const timers: NodeJS.Timeout[] = [];
    
    // Determine if this is after initial greeting (only 1 assistant message and no user messages)
    const assistantCount = messages.filter(m => m.role === 'assistant').length;
    const userCount = messages.filter(m => m.role === 'user').length;
    const isAfterGreeting = assistantCount === 1 && userCount === 0;
    
    if (isAfterGreeting) {
      console.log('After greeting - setting up 20s/30s/40s timers');
      // After greeting: 20s, 30s, 40s progression
      const timer1 = setTimeout(() => {
        console.log('20s timer fired - sending first nudge');
        setNudgeCount(1);
        handleStreamingResponse('[IDLE-NUDGE]');
      }, 20000); // 20s - first panic
      timers.push(timer1);
      
      const timer2 = setTimeout(() => {
        console.log('30s timer fired - sending second nudge');
        setNudgeCount(2);
        handleStreamingResponse('[IDLE-NUDGE]');
      }, 30000); // 30s - more panic with context
      timers.push(timer2);
      
      const timer3 = setTimeout(() => {
        console.log('40s timer fired - sending final nudge');
        setNudgeCount(3);
        // Force progression before final message
        setConversationState(prev => ({
          ...prev,
          hasAskedForHelp: true,
          hasOfferedToShowImages: true,
          emotionalState: 'desperate'
        }));
        // Force link to show with this message
        setShowingButton(true);
        setForceShowLink(true);
        handleStreamingResponse('[IDLE-NUDGE]');
        // END SEQUENCE
        setTimeout(() => {
          setHasResigned(true);
          clearIdleTimers();
          console.log('Final message sent - ending all timers');
        }, 2000);
      }, 40000); // 40s - desperate with link
      timers.push(timer3);
    } else if (userCount > 0) {
      // Normal conversation flow - only if user has actually responded
      const firstDelay = userDismissive ? 3000 : 10000;
      
      timers.push(setTimeout(() => {
        setNudgeCount(0);
        handleStreamingResponse('[IDLE-NUDGE]');
      }, firstDelay));
      
      timers.push(setTimeout(() => {
        setNudgeCount(1);
        setConversationState(prev => ({
          ...prev,
          hasAskedForHelp: true,
          emotionalState: 'desperate'
        }));
        handleStreamingResponse('[IDLE-NUDGE]');
        setTimeout(() => {
          setShowingButton(true);
        }, 2000);
      }, firstDelay + 10000));
    }
    
    idleTimersRef.current = timers;
    console.log(`Set ${timers.length} timers`);
    
    return () => clearIdleTimers();
  }, [messages.length, hasGreeted, isLoading, puzzleState, hasResigned, clearIdleTimers, nudgeCount]);
  
  // Initialize conversation only once
  useEffect(() => {
    // Only initialize if we don't have a conversation ID yet
    if (conversationId) return;
    
    const initConversation = async () => {
      console.log('Initializing conversation...');
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [], conversationId: null }),
        });
        
        const newConversationId = response.headers.get('X-Conversation-Id');
        console.log('Received conversation ID:', newConversationId);
        
        if (newConversationId) {
          setConversationId(newConversationId);
          onConversationStart?.(newConversationId);
        } else {
          console.error('No conversation ID received from API');
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
      }
    };
    
    initConversation();
  }, []); // Empty dependency array - only run once on mount
  
  // Handle user messages
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    // Clear idle timers on user interaction
    clearIdleTimers();
    
    // If resigned, reset to allow agent to respond
    if (hasResigned) {
      setHasResigned(false);
    }
    
    const userMessage = userInput;
    setUserInput('');
    
    // Add user message (but not for special system messages)
    if (!userMessage.startsWith('[')) {
      const newUserMessage: Message = {
        id: nanoid(),
        role: 'user',
        content: userMessage,
        createdAt: new Date(),
      };
      
      setMessages(prev => [...prev, newUserMessage]);
    }
    
    // Analyze sentiment
    const sentiment = analyzeUserSentiment(userMessage);
    setConversationState(prev => ({ ...prev, userSentiment: sentiment }));
    
    // Get AI response
    await handleStreamingResponse(userMessage);
  };
  
  // Handle puzzle button click
  const handleHelpClick = async () => {
    console.log('Help button clicked, conversationId:', conversationId);
    
    // Don't interrupt if still loading/streaming
    if (isLoading) {
      console.log('Still streaming, ignoring click');
      return;
    }
    
    if (!conversationId) {
      console.error('No conversation ID available');
      return;
    }
    
    // Mark that puzzles have started
    setPuzzleStarted(true);
    
    try {
      const response = await fetch(`/api/puzzle?conversationId=${conversationId}`);
      
      if (!response.ok) {
        console.error('Puzzle API error:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        return;
      }
      
      const data = await response.json();
      console.log('Puzzle data received:', data);
      
      if (data.puzzleType) {
        onPuzzleOpen(data.puzzleType);
      }
    } catch (error) {
      console.error('Failed to fetch puzzle:', error);
    }
  };
  
  // Auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);
  
  // Check if we should show the button based on current messages
  useEffect(() => {
    // Skip if button already showing
    if (showingButton) return;
    
    // Check if user has offered help
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    // Allow button to show even without user engagement after enough time
    if (userMessages.length === 0 && assistantMessages.length < 4) return; // Wait for panic messages
    
    // Check last user message for help offer
    const lastUserMessage = userMessages[userMessages.length - 1]?.content?.toLowerCase() || '';
    const userOfferedHelp = 
      lastUserMessage.includes('help') || 
      lastUserMessage.includes('ok') || 
      lastUserMessage.includes('what') ||
      lastUserMessage.includes('do');
    
    // Check if any recent assistant message has the link context
    const recentAssistantMessages = assistantMessages.slice(-3); // Last 3 messages
    const hasLinkContext = recentAssistantMessages.some(msg => {
      const content = msg.content.toLowerCase();
      return (content.includes('here') || content.includes('these') || content.includes('stuck on')) &&
             (content.includes('verification') || content.includes('tasks') || content.includes('show'));
    });
    
    if (userOfferedHelp && hasLinkContext) {
      console.log('Conditions met - showing button!');
      setShowingButton(true);
    }
  }, [messages, showingButton]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isLastAssistantMessage = message.role === 'assistant' && 
              index === messages.map((m, i) => m.role === 'assistant' ? i : -1)
                .filter(i => i !== -1)
                .pop();
            
            // Show link when agent mentions they're providing it
            const messageContent = message.content.toLowerCase();
            const isProvidingLink = 
              messageContent.includes('here\'s') ||
              messageContent.includes('here is') ||
              messageContent.includes('here are') ||
              messageContent.includes('let me show') ||
              messageContent.includes('show you') ||
              messageContent.includes('look at') ||
              messageContent.includes('verification') ||
              messageContent.includes('bot detection') ||
              messageContent.includes('tests') ||
              messageContent.includes('what\'s blocking') ||
              messageContent.includes('stuck on');
            
            const shouldShowLink = showingButton && message.role === 'assistant' && 
              (message.id === linkMessageId || (isProvidingLink && !puzzleStarted));
            
            return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#FFB500] text-[#351C15]'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
                {shouldShowLink && conversationId && !puzzleStarted && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2"
                  >
                    <button
                      onClick={handleHelpClick}
                      disabled={isLoading}
                      className={`text-sm underline ${
                        isLoading 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:text-blue-800 cursor-pointer'
                      }`}
                    >
                      Click here to view the verification images
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
            );
          })}
          
          {/* Streaming message */}
          {currentStreamingMessage && (
            <motion.div
              key={streamingMessageId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%]">
                <div className="rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                  {currentStreamingMessage}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isLoading && !currentStreamingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB500]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="px-4 py-2 bg-[#FFB500] text-[#351C15] font-medium rounded-lg hover:bg-[#FFC833] transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}