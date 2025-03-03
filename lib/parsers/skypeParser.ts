import fs from 'fs/promises';
import { SkypeMessage } from '../../types';

/**
 * Process a directory containing Skype JSON export files
 */
export async function processSkypeDirectory(directory: string): Promise<{ files: string[] }> {
  const files = await fs.readdir(directory);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  return { files: jsonFiles };
}

/**
 * Parse a Skype JSON export file
 */
export async function parseSkypeFile(filePath: string): Promise<{
  participants: string[];
  messages: SkypeMessage[];
}> {
  const content = await fs.readFile(filePath, 'utf-8');
  const skypeData = JSON.parse(content);
  
  // Get unique participants from all conversations
  const participants = new Set<string>();
  const messages: SkypeMessage[] = [];
  
  for (const conversation of skypeData.conversations) {
    // Add participants
    if (conversation.displayName) {
      participants.add(conversation.displayName);
    }
    
    // Process messages
    for (const msg of conversation.MessageList) {
      if (msg.messagetype === 'RichText' || msg.messagetype === 'Text') {
        messages.push({
          sender: msg.displayName || msg.from,
          content: msg.content,
          timestamp: new Date(msg.originalarrivaltime),
          conversationId: msg.conversationid,
          messageType: msg.messagetype,
          isFromMe: msg.from === skypeData.userId
        });
      }
    }
  }
  
  return {
    participants: Array.from(participants),
    messages: messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  };
} 