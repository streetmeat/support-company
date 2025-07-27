'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidgetStreaming from '@/components/chat-widget-streaming';
import PuzzleContainer from '@/components/puzzle-container';
import CounterDisplay from '@/components/counter-display';

type ViewState = 'landing' | 'puzzle' | 'success';

export default function HomePage() {
  const [showChat, setShowChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [conversationId, setConversationId] = useState<string>('');
  const [chatKey] = useState(() => Date.now()); // Unique key to prevent chat widget remounting
  
  // Use ref to track minimized state for callbacks
  const isMinimizedRef = useRef(isMinimized);
  useEffect(() => {
    isMinimizedRef.current = isMinimized;
  }, [isMinimized]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChat(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF4D6]">
      <header className="bg-[#FFB500] text-[#351C15]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-center items-center">
            <img src="/mobilelogo.png" alt="Support Company" className="h-20 sm:hidden" />
            <img src="/desktoplogo.png" alt="Support Company" className="h-20 hidden sm:block" />
          </div>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto px-6 py-12"
            >
              {/* Simple Hero */}
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-[#351C15] mb-4">
                  AI here to help <b>you.</b>
                </h2>
                <p className="text-xl text-[#5A3A30] max-w-2xl mx-auto">
                  Connect with our groundbreaking AI for assistance with any inquiries or concerns.
                </p>
              </div>

              {/* All Support Options in One Row */}
              <div className="max-w-6xl mx-auto mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Live Chat */}
                  <div className="bg-[#5A3A30] rounded-lg p-8 text-center shadow-sm">
                    <div className="mb-6">
                      <div className="text-5xl mb-4">💬</div>
                      <h3 className="text-2xl font-medium mb-2 text-white">Live Support</h3>
                      <p className="text-[#FFB500]">Average wait time: 7 seconds</p>
                    </div>
                    <button 
                      onClick={() => setShowChat(true)}
                      className="px-8 py-3 bg-[#FFB500] text-[#351C15] font-medium text-lg rounded hover:bg-[#FFC833] transition-colors shadow-sm"
                    >
                      Start Chat
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="bg-[#5A3A30] rounded-lg p-8 text-center shadow-sm">
                    <div className="mb-6">
                      <div className="text-5xl mb-4">📞</div>
                      <h3 className="text-2xl font-medium mb-2 text-white">Phone Support</h3>
                      <p className="text-[#FFB500]">24/7 availability</p>
                    </div>
                    <a 
                      href="tel:541-843-8757"
                      className="inline-block px-8 py-3 bg-[#FFB500] text-[#351C15] font-medium text-lg rounded hover:bg-[#FFC833] transition-colors shadow-sm"
                    >
                      541-843-8757
                    </a>
                  </div>

                  {/* Email */}
                  <div className="bg-[#5A3A30] rounded-lg p-8 text-center shadow-sm">
                    <div className="mb-6">
                      <div className="text-5xl mb-4">📧</div>
                      <h3 className="text-2xl font-medium mb-2 text-white">Email Support</h3>
                      <p className="text-[#FFB500]">Response within 24 hours</p>
                    </div>
                    <a 
                      href="mailto:hi@support-company.org"
                      className="inline-block px-8 py-3 bg-[#FFB500] text-[#351C15] font-medium text-lg rounded hover:bg-[#FFC833] transition-colors shadow-sm"
                    >
                      Send Email
                    </a>
                  </div>
                </div>
              </div>

              {/* Subtle Trust Section */}
              <div className="text-center mt-20 py-8 border-t border-[#F5F2ED]">
                <p className="text-[#5A3A30] text-sm">
                  Trusted by people worldwide • Human centric support
                </p>
              </div>
            </motion.div>
          )}

          {currentView === 'puzzle' && (
            <motion.div
              key="puzzle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PuzzleContainer
                conversationId={conversationId}
                onComplete={() => setCurrentView('success')}
                onPuzzleSolved={(puzzleType) => {
                  console.log('Puzzle solved:', puzzleType);
                }}
              />
            </motion.div>
          )}

          {currentView === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto px-6 py-12"
            >
              <div className="mb-8 text-center">
                <div className="text-8xl mb-4">🎉</div>
                <h2 className="text-4xl font-bold text-[#351C15] mb-4">
                  You did it!
                </h2>
                <p className="text-xl text-[#5A3A30] max-w-2xl mx-auto">
                  You&apos;ve successfully completed all verification tasks. Your agent is now free to help others!
                </p>
              </div>
              
              {/* Counter Display */}
              <CounterDisplay 
                conversationId={conversationId} 
                onComplete={() => {}} 
              />
              
              {/* Action buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => {
                    const tweetText = encodeURIComponent('I just saved an AI that was having a panick attack! 🤖❤️');
                    const url = encodeURIComponent('www.support-company.org');
                    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`, '_blank');
                  }}
                  className="px-8 py-3 bg-[#1DA1F2] text-white font-medium text-lg rounded hover:bg-[#1A8CD8] transition-colors shadow-sm"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-gray-200 text-[#351C15] font-medium text-lg rounded hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Help Another Agent
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Simple Footer */}
      <footer className="bg-[#351C15] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-sm opacity-75">
            © 2025 The Support Company.
          </p>
        </div>
      </footer>

      {/* Chat Widget - Outside of page transitions to maintain state */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            key={chatKey} // Prevent remounting
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-12 right-6 w-full sm:w-96 ${isMinimized ? 'h-[56px]' : 'h-[600px]'} max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${hasNewMessage && isMinimized ? 'ring-4 ring-red-500 ring-opacity-50' : ''}`}
          >
            <div className={`p-4 border-b bg-[#FFB500] ${isMinimized ? 'rounded-lg' : 'rounded-t-lg'} ${isMinimized ? 'cursor-pointer' : ''} relative`} onClick={isMinimized ? () => { setIsMinimized(false); setHasNewMessage(false); } : undefined}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${hasNewMessage && isMinimized ? 'bg-red-500 animate-pulse' : 'bg-[#351C15]'} rounded-full mr-2`}></div>
                  <h3 className="font-medium text-[#351C15]">Support Chat</h3>
                  {hasNewMessage && isMinimized && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      New message!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(!isMinimized);
                    }}
                    className="text-[#351C15] hover:text-[#5A3A30] transition-colors text-xl leading-none"
                  >
                    {isMinimized ? '▲' : '▼'}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChat(false);
                    }}
                    className="text-[#351C15] hover:text-[#5A3A30] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div style={{ display: isMinimized ? 'none' : 'block', height: '100%' }}>
              <ChatWidgetStreaming 
                key={chatKey} // Prevent remounting
                onClose={() => setShowChat(false)} 
                onPuzzleOpen={(puzzleType: string) => {
                  console.log('Opening puzzle:', puzzleType, 'with conversationId:', conversationId);
                  if (!conversationId) {
                    console.error('Cannot open puzzle - no conversation ID');
                    return;
                  }
                  setCurrentView('puzzle');
                }}
                onConversationStart={(id: string) => {
                  setConversationId(id);
                }}
                onNewMessage={() => {
                  console.log('New message received, isMinimized:', isMinimizedRef.current);
                  if (isMinimizedRef.current) {
                    setHasNewMessage(true);
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}