import { readFile, access } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { Idea, Source } from '../../../types';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'ideas.json');
    
    // Check if file exists
    try {
      await access(dataPath);
    } catch (error) {
      return NextResponse.json({ ideas: [], sources: [] });
    }
    
    const data = await readFile(dataPath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Convert date strings to Date objects
    const ideas = parsed.ideas.map((idea: any) => ({
      ...idea,
      timestamp: new Date(idea.timestamp),
      createdAt: new Date(idea.createdAt),
      updatedAt: new Date(idea.updatedAt)
    }));
    
    const sources = parsed.sources.map((source: any) => ({
      ...source,
      processedAt: source.processedAt ? new Date(source.processedAt) : undefined,
      createdAt: new Date(source.createdAt),
      updatedAt: new Date(source.updatedAt)
    }));
    
    // Sort ideas by confidence score (highest first)
    const sortedIdeas = [...ideas].sort((a, b) => b.confidenceScore - a.confidenceScore);
    
    return NextResponse.json({ ideas: sortedIdeas, sources });
  } catch (error) {
    console.error('Error reading ideas:', error);
    return NextResponse.json({ ideas: [], sources: [] }, { status: 500 });
  }
} 