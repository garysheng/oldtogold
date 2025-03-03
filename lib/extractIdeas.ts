import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { processIMessageDirectory, parseIMessageFile } from './parsers/iMessageParser';
import { processAppleNotesDirectory } from './parsers/appleNotesParser';
import { processSkypeDirectory, parseSkypeFile } from './parsers/skypeParser';
import { processTextInChunks, checkOllamaStatus } from './llm/ollamaService';
import { Idea, Source, IdeaExtractionResponse } from '../types';

/**
 * Main function to extract ideas from iMessage, Apple Notes, and Skype files
 */
export async function extractIdeasFromFiles(
  iMessageDir: string,
  appleNotesDir: string,
  skypeDir: string = '',
  outputFile: string = 'ideas.json',
  modelName: string = 'deepseek-r1'
): Promise<{
  ideas: Idea[];
  sources: Source[];
  stats: {
    totalSources: number;
    totalIdeas: number;
    processingTimeMs: number;
  };
}> {
  const startTime = Date.now();
  
  // Check if Ollama is running
  const ollamaStatus = await checkOllamaStatus(modelName);
  if (!ollamaStatus.running || !ollamaStatus.modelAvailable) {
    throw new Error(ollamaStatus.error);
  }
  
  // Process iMessage files if directory is provided
  let iMessageResults = { files: [] as string[] };
  if (iMessageDir) {
    console.log(`Processing iMessage files from ${iMessageDir}...`);
    iMessageResults = await processIMessageDirectory(iMessageDir);
  }
  
  // Process Apple Notes files if directory is provided
  let appleNotesResults = { files: [] as string[] };
  if (appleNotesDir) {
    console.log(`Processing Apple Notes files from ${appleNotesDir}...`);
    appleNotesResults = await processAppleNotesDirectory(appleNotesDir);
  }
  
  // Process Skype files if directory is provided
  let skypeResults = { files: [] as string[] };
  if (skypeDir) {
    console.log(`Processing Skype files from ${skypeDir}...`);
    skypeResults = await processSkypeDirectory(skypeDir);
  }
  
  // Load existing sources and ideas if the file exists
  let existingSources: Source[] = [];
  let allIdeas: Idea[] = [];
  try {
    if (await fileExists(outputFile)) {
      const existingData = JSON.parse(await fs.readFile(outputFile, 'utf-8'));
      allIdeas = existingData.ideas || [];
      existingSources = existingData.sources || [];
      console.log(`Loaded ${allIdeas.length} existing ideas and ${existingSources.length} sources from ${outputFile}`);
    }
  } catch (error) {
    console.warn(`Could not load existing ideas from ${outputFile}:`, error);
  }
  
  // Create a map of existing sources by path for quick lookup
  const existingSourcesByPath = new Map<string, Source>();
  existingSources.forEach(source => {
    existingSourcesByPath.set(source.path, source);
  });
  
  // Create new sources or use existing ones
  const sources: Source[] = [];
  
  // Process iMessage sources
  if (iMessageDir) {
    for (const file of iMessageResults.files) {
      const filePath = path.join(iMessageDir, file);
      const existingSource = existingSourcesByPath.get(filePath);
      
      if (existingSource && existingSource.processed) {
        console.log(`Skipping already processed iMessage file: ${file}`);
        sources.push(existingSource);
      } else {
        sources.push({
          id: existingSource?.id || uuidv4(),
          type: 'iMessage' as const,
          path: filePath,
          filename: file,
          processed: false,
          ideasExtracted: existingSource?.ideasExtracted || 0,
          createdAt: existingSource?.createdAt ? new Date(existingSource.createdAt) : new Date(),
          updatedAt: new Date()
        });
      }
    }
  }
  
  // Process Apple Notes sources
  if (appleNotesDir) {
    for (const file of appleNotesResults.files) {
      const filePath = path.join(appleNotesDir, file);
      const existingSource = existingSourcesByPath.get(filePath);
      
      if (existingSource && existingSource.processed) {
        console.log(`Skipping already processed Apple Note: ${file}`);
        sources.push(existingSource);
      } else {
        sources.push({
          id: existingSource?.id || uuidv4(),
          type: 'AppleNote' as const,
          path: filePath,
          filename: file,
          processed: false,
          ideasExtracted: existingSource?.ideasExtracted || 0,
          createdAt: existingSource?.createdAt ? new Date(existingSource.createdAt) : new Date(),
          updatedAt: new Date()
        });
      }
    }
  }
  
  // Process Skype sources
  if (skypeDir) {
    for (const file of skypeResults.files) {
      const filePath = path.join(skypeDir, file);
      const existingSource = existingSourcesByPath.get(filePath);
      
      if (existingSource && existingSource.processed) {
        console.log(`Skipping already processed Skype file: ${file}`);
        sources.push(existingSource);
      } else {
        sources.push({
          id: existingSource?.id || uuidv4(),
          type: 'Skype' as const,
          path: filePath,
          filename: file,
          processed: false,
          ideasExtracted: existingSource?.ideasExtracted || 0,
          createdAt: existingSource?.createdAt ? new Date(existingSource.createdAt) : new Date(),
          updatedAt: new Date()
        });
      }
    }
  }
  
  // Extract ideas from iMessage conversations
  const iMessageIdeas: Idea[] = [];
  const unprocessedIMessageSources = sources.filter(s => s.type === 'iMessage' && !s.processed);
  console.log(`Found ${unprocessedIMessageSources.length} unprocessed iMessage sources to extract ideas from`);
  
  for (const source of unprocessedIMessageSources) {
    try {
      // Create a privacy-friendly description of the conversation
      const sourceDescription = getPrivacyFriendlyDescription(source.filename);
      console.log(`Extracting ideas from ${sourceDescription}...`);
      
      // Get messages for this file
      const filePath = source.path;
      const { participants, messages } = await parseIMessageFile(filePath);
      
      if (messages.length === 0) {
        console.log(`No messages found in ${sourceDescription}`);
        continue;
      }
      
      // Format messages for LLM processing
      const messagesText = messages
        .map(m => `${m.sender}: ${m.content}`)
        .join('\n');
      
      // Process text with LLM
      const extractedIdeas = await processTextInChunks(messagesText, 4000, modelName);
      
      // Convert to Idea objects
      const ideas = extractedIdeas.map(idea => {
        return {
          id: uuidv4(),
          title: idea.title,
          description: idea.description,
          problem: idea.problem,
          targetAudience: idea.targetAudience,
          confidenceScore: idea.confidenceScore,
          reasoning: idea.reasoning,
          sourceFile: source.path,
          sourceType: 'iMessage' as const,
          timestamp: messages[0].timestamp, // Use timestamp of first message
          participants: participants,
          context: messagesText.substring(0, 500) + (messagesText.length > 500 ? '...' : ''), // First 500 chars as context
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
      
      iMessageIdeas.push(...ideas);
      allIdeas.push(...ideas);
      
      // Update source
      source.processed = true;
      source.processedAt = new Date();
      source.ideasExtracted = ideas.length;
      source.updatedAt = new Date();
      
      console.log(`Found ${ideas.length} ideas in ${sourceDescription}`);
      
      // Save incrementally after each source is processed
      await saveToFile(outputFile, allIdeas, sources);
    } catch (error) {
      console.error(`Error processing ${source.filename}:`, error);
    }
  }
  
  // Extract ideas from Apple Notes
  const appleNotesIdeas: Idea[] = [];
  const unprocessedAppleNotesSources = sources.filter(s => s.type === 'AppleNote' && !s.processed);
  console.log(`Found ${unprocessedAppleNotesSources.length} unprocessed Apple Notes sources to extract ideas from`);
  
  for (const source of unprocessedAppleNotesSources) {
    try {
      console.log(`Extracting ideas from ${source.filename}...`);
      
      // Get note content
      const { notes } = await processAppleNotesDirectory(path.dirname(source.path));
      const note = notes.find(n => n.filepath === source.path);
      
      if (note) {
        // Process text with LLM
        const extractedIdeas = await processTextInChunks(note.content, 4000, modelName);
        
        // Convert to Idea objects
        const ideas = extractedIdeas.map(idea => {
          return {
            id: uuidv4(),
            title: idea.title,
            description: idea.description,
            problem: idea.problem,
            targetAudience: idea.targetAudience,
            confidenceScore: idea.confidenceScore,
            reasoning: idea.reasoning,
            sourceFile: source.path,
            sourceType: 'AppleNote' as const,
            timestamp: note.createdAt,
            context: note.content.substring(0, 500) + (note.content.length > 500 ? '...' : ''), // First 500 chars as context
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
        });
        
        appleNotesIdeas.push(...ideas);
        allIdeas.push(...ideas);
        
        // Update source
        source.processed = true;
        source.processedAt = new Date();
        source.ideasExtracted = ideas.length;
        source.updatedAt = new Date();
        
        console.log(`Found ${ideas.length} ideas in ${source.filename}`);
        
        // Save incrementally after each source is processed
        await saveToFile(outputFile, allIdeas, sources);
      }
    } catch (error) {
      console.error(`Error processing ${source.filename}:`, error);
    }
  }
  
  // Extract ideas from Skype conversations
  const skypeIdeas: Idea[] = [];
  const unprocessedSkypeSources = sources.filter(s => s.type === 'Skype' && !s.processed);
  console.log(`Found ${unprocessedSkypeSources.length} unprocessed Skype sources to extract ideas from`);
  
  for (const source of unprocessedSkypeSources) {
    try {
      console.log(`Extracting ideas from Skype file ${source.filename}...`);
      
      // Get messages for this file
      const filePath = source.path;
      const { participants, messages } = await parseSkypeFile(filePath);
      
      if (messages.length === 0) {
        console.log(`No messages found in ${source.filename}`);
        continue;
      }
      
      // Format messages for LLM processing
      const messagesText = messages
        .map(m => `${m.sender}: ${m.content}`)
        .join('\n');
      
      // Process text with LLM
      const extractedIdeas = await processTextInChunks(messagesText, 4000, modelName);
      
      // Convert to Idea objects
      const ideas = extractedIdeas.map(idea => {
        return {
          id: uuidv4(),
          title: idea.title,
          description: idea.description,
          problem: idea.problem,
          targetAudience: idea.targetAudience,
          confidenceScore: idea.confidenceScore,
          reasoning: idea.reasoning,
          sourceFile: source.path,
          sourceType: 'Skype' as const,
          timestamp: messages[0].timestamp, // Use timestamp of first message
          participants: participants,
          context: messagesText.substring(0, 500) + (messagesText.length > 500 ? '...' : ''), // First 500 chars as context
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
      
      skypeIdeas.push(...ideas);
      allIdeas.push(...ideas);
      
      // Update source
      source.processed = true;
      source.processedAt = new Date();
      source.ideasExtracted = ideas.length;
      source.updatedAt = new Date();
      
      console.log(`Found ${ideas.length} ideas in ${source.filename}`);
      
      // Save incrementally after each source is processed
      await saveToFile(outputFile, allIdeas, sources);
    } catch (error) {
      console.error(`Error processing ${source.filename}:`, error);
    }
  }
  
  // Final save to file
  await saveToFile(outputFile, allIdeas, sources);
  
  const endTime = Date.now();
  const processingTimeMs = endTime - startTime;
  
  return {
    ideas: allIdeas,
    sources,
    stats: {
      totalSources: sources.length,
      totalIdeas: allIdeas.length,
      processingTimeMs
    }
  };
}

/**
 * Helper function to check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to save ideas and sources to a file
 */
async function saveToFile(filePath: string, ideas: Idea[], sources: Source[]): Promise<void> {
  await fs.writeFile(
    filePath, 
    JSON.stringify({ ideas, sources }, null, 2)
  );
}

/**
 * Helper function to create a privacy-friendly description of a conversation
 */
function getPrivacyFriendlyDescription(filename: string): string {
  // If it's a Skype JSON file
  if (filename.endsWith('.json')) {
    return 'a Skype conversation';
  }
  
  // If it's a phone number format
  if (filename.includes('+')) {
    // Count how many phone numbers are in the filename
    const phoneNumbers = filename.split(',').map(part => part.trim());
    if (phoneNumbers.length > 1) {
      return `a group message with ${phoneNumbers.length} people`;
    } else {
      return `a direct message`;
    }
  }
  
  // If it's a named chat
  if (filename.includes(' - ')) {
    const chatName = filename.split(' - ')[0];
    return `the "${chatName}" chat`;
  }
  
  // If it's an email address
  if (filename.includes('@')) {
    return `a conversation with an email contact`;
  }
  
  // Default
  return filename;
}