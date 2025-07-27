'use client';

import { useState, useEffect } from 'react';

export default function CounterDisplay() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounter = async () => {
      try {
        // Just fetch the current count - no incrementing here
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

    fetchCounter();
  }, []);

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
    </div>
  );
}