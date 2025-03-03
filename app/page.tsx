'use client';

import { useState, useEffect } from 'react';
import { Idea, Source } from '../types';
import IdeasList from './components/IdeasList';
import PhoneToggle from './components/PhoneToggle';
import Image from 'next/image';

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [showPhoneNumbers, setShowPhoneNumbers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIdeas() {
      try {
        const response = await fetch('/api/ideas');
        const data = await response.json();
        setIdeas(data.ideas);
        setSources(data.sources);
      } catch (error) {
        console.error('Error loading ideas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadIdeas();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gray-900 text-white">
      <div className="flex items-center gap-4 mb-8">
        <Image 
          src="/logo.webp" 
          alt="OldToGold Logo" 
          width={60} 
          height={60} 
          className="rounded-md"
        />
        <h1 className="text-4xl font-bold">OldToGold: Startup Idea Miner</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Results From Your iMessage & Apple Notes Mining</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-900 rounded-full">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-300">Total Ideas</h3>
                  <p className="text-5xl font-bold mt-2">{ideas.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-purple-900 rounded-full">
                  <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-300">Sources Processed</h3>
                  <p className="text-5xl font-bold mt-2">{sources.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center mb-8">
            <PhoneToggle 
              showPhoneNumbers={showPhoneNumbers} 
              setShowPhoneNumbers={setShowPhoneNumbers} 
            />
          </div>

          <h2 className="text-2xl font-bold mb-4">Extracted Ideas</h2>
          <IdeasList ideas={ideas} showPhoneNumbers={showPhoneNumbers} />
        </>
      )}
    </main>
  );
}
