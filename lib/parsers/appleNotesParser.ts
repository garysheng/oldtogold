import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import { AppleNote } from '../../types';

/**
 * Parse an Apple Notes markdown file
 */
export async function parseAppleNotesFile(filePath: string): Promise<AppleNote> {
  try {
    // Read the file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract title and creation date from filename
    // Example filename: "My Note Title - 2024-03-01.md"
    const fileName = path.basename(filePath, '.md');
    let title = fileName;
    let createdAt = new Date();
    
    const dateMatch = fileName.match(/(.+) - (\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
      title = dateMatch[1].trim();
      createdAt = new Date(dateMatch[2]);
    }
    
    return {
      title,
      content,
      createdAt,
      filepath: filePath
    };
  } catch (error) {
    console.error(`Error parsing Apple Notes file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Process a directory of Apple Notes markdown files
 */
export async function processAppleNotesDirectory(directoryPath: string): Promise<{
  notes: AppleNote[];
  files: string[];
}> {
  const files = await fs.readdir(directoryPath);
  const mdFiles = files.filter(file => file.endsWith('.md'));
  
  const notes: AppleNote[] = [];
  
  for (const file of mdFiles) {
    const filePath = path.join(directoryPath, file);
    try {
      const note = await parseAppleNotesFile(filePath);
      notes.push(note);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  // Sort notes by creation date (newest first)
  notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return {
    notes,
    files: mdFiles
  };
}

/**
 * Convert markdown content to HTML
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
} 