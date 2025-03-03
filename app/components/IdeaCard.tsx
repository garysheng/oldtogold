'use client';

import path from 'path';
import { useState } from 'react';
import { Idea } from '../../types';

interface IdeaCardProps {
  idea: Idea;
  showPhoneNumbers: boolean;
}

// Function to get a privacy-friendly description of a source
function getSourceDescription(idea: Idea, showPhoneNumbers: boolean): string {
  const filename = path.basename(idea.sourceFile);
  
  if (idea.sourceType === 'iMessage') {
    // If it's a phone number format
    if (filename.includes('+')) {
      // Extract phone numbers from the filename
      const phoneNumbers = filename.split(',').map(part => part.trim());
      
      if (showPhoneNumbers) {
        // Show actual phone numbers
        if (phoneNumbers.length > 1) {
          return `Group message with: ${phoneNumbers.join(', ')}`;
        } else {
          return `Direct message with: ${phoneNumbers[0]}`;
        }
      } else {
        // Return blurred phone numbers that will be visually blurred in the UI
        if (phoneNumbers.length > 1) {
          return `Group message with: ${phoneNumbers.join(', ')}`;
        } else {
          return `Direct message with: ${phoneNumbers[0]}`;
        }
      }
    }
    
    // If it's a named chat
    if (filename.includes(' - ')) {
      const chatName = filename.split(' - ')[0];
      return `"${chatName}" chat`;
    }
    
    // If it's an email address
    if (filename.includes('@')) {
      return `Conversation with an email contact`;
    }
  } else if (idea.sourceType === 'AppleNote') {
    return `Apple Note: ${filename.replace('.md', '')}`;
  }
  
  // Default
  return idea.sourceType;
}

export default function IdeaCard({ idea, showPhoneNumbers }: IdeaCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const sourceDescription = getSourceDescription(idea, showPhoneNumbers);
  
  return (
    <div className="bg-gray-800 p-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{idea.title}</h3>
      </div>
      <div className="mb-4">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 py-1 px-3 rounded transition-all duration-200 flex items-center"
        >
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
          <svg 
            className={`ml-1 w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {showDetails && (
        <div className="mb-4 space-y-4 border-l-2 border-blue-500 pl-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-1">Description</h4>
            <p className="text-sm text-gray-400">{idea.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-sm ${
              idea.confidenceScore >= 8 ? 'bg-green-900 text-green-100' :
              idea.confidenceScore >= 6 ? 'bg-blue-900 text-blue-100' :
              idea.confidenceScore >= 4 ? 'bg-yellow-900 text-yellow-100' :
              'bg-red-900 text-red-100'
            }`}>
              Confidence: {idea.confidenceScore}/10
            </span>
            <span className="text-xs text-gray-400">
              (AI-calculated score based on idea clarity, problem definition, market potential, and implementation feasibility)
            </span>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-1">Problem</h4>
            <p className="text-sm text-gray-400">{idea.problem}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-1">Target Audience</h4>
            <p className="text-sm text-gray-400">{idea.targetAudience}</p>
          </div>
          
          {idea.reasoning && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Reasoning</h4>
              <p className="text-sm text-gray-400">{idea.reasoning}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-1">Source</h4>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-400">{sourceDescription}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(idea.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 