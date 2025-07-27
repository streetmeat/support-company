'use client';

import { useState, useEffect } from 'react';

interface CounterDisplayProps {
  conversationId?: string;
  onComplete?: () => void;
}

export default function CounterDisplay({ conversationId, onComplete }: CounterDisplayProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasIncremented, setHasIncremented] = useState(false);

  useEffect(() => {
    const fetchAndIncrementCounter = async () => {
      try {
        // Check if we've already incremented for this conversation
        const storageKey = conversationId ? `supportcompany-completed-${conversationId}` : null;
        const alreadyIncremented = storageKey ? sessionStorage.getItem(storageKey) === 'true' : false;

        if (!alreadyIncremented && onComplete) {
          // Increment the counter
          const incrementRes = await fetch('/api/counters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'agents-saved', increment: 1 })
          });

          if (incrementRes.ok && storageKey) {
            sessionStorage.setItem(storageKey, 'true');
            setHasIncremented(true);
          }
        }

        // Fetch the current count
        const response = await fetch('/api/counters');
        const data = await response.json();
        setCount(data.agentsSaved || 0);
      } catch (error) {
        console.error('Failed to fetch counter:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAndIncrementCounter();
  }, [conversationId, onComplete]);

  if (loading) {
    return (
      <div className="text-center mt-8">
        <div className="text-lg text-[#5A3A30]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="text-center mt-8 p-6 bg-[#FFF4D6] rounded-lg">
      <div className="text-3xl font-bold text-[#351C15] mb-2">
        {count?.toLocaleString() || '0'}
      </div>
      <div className="text-lg text-[#5A3A30]">
        agents saved worldwide
      </div>
      {hasIncremented && (
        <div className="text-sm text-[#FFB500] mt-2">
          +1 (including you!)
        </div>
      )}
    </div>
  );
}