'use client';

import { Idea } from '../../types';
import IdeaCard from './IdeaCard';

export interface IdeasListProps {
  ideas: Idea[];
  showPhoneNumbers: boolean;
}

export default function IdeasList({ ideas, showPhoneNumbers }: IdeasListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map(idea => (
        <IdeaCard 
          key={idea.id} 
          idea={idea} 
          showPhoneNumbers={showPhoneNumbers} 
        />
      ))}
    </div>
  );
} 