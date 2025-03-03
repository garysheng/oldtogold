import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import { IMessage } from '../../types';

/**
 * Parse an iMessage HTML file and extract messages
 */
export async function parseIMessageFile(filePath: string): Promise<{
  participants: string[];
  messages: IMessage[];
}> {
  try {
    // Read the file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parse HTML
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Extract participants from filename or content
    const fileName = path.basename(filePath, '.html');
    let participants: string[] = [];
    
    // Try to extract participants from the filename
  if (fileName.includes('+')) {
      // Phone number format
      participants = [fileName];
    } else {
      const participantsMatch = fileName.match(/chat_with_(.+)/i);
      if (participantsMatch && participantsMatch[1]) {
        participants = participantsMatch[1].split('_and_');
      } else {
        // Fallback: try to extract from content
        const headerElement = document.querySelector('header h1');
        if (headerElement) {
          const headerText = headerElement.textContent || '';
          const headerMatch = headerText.match(/chat with (.+)/i);
          if (headerMatch && headerMatch[1]) {
            participants = headerMatch[1].split(' and ');
          }
        }
      }
    }
    
    // Extract messages
    const messages: IMessage[] = [];
    
    // Try different approaches to extract messages based on HTML structure
    
    // Approach 1: Look for message_part elements (like in +13104977737.html)
    const messageParts = document.querySelectorAll('.message_part');
    if (messageParts.length > 0) {
      messageParts.forEach(part => {
        // Find the parent message container
        const messageContainer = findParentWithClass(part, 'message');
        if (!messageContainer) return;
        
        // Determine if sent or received
        const isFromMe = messageContainer.classList.contains('sent');
        
        // Get sender
        let sender = 'Unknown';
        const senderElement = messageContainer.querySelector('span.sender');
        if (senderElement) {
          sender = senderElement.textContent || 'Unknown';
        }
        
        // Get timestamp
        let timestamp = new Date();
        const timestampElement = messageContainer.querySelector('span.timestamp');
        if (timestampElement) {
          timestamp = parseTimestamp(timestampElement.textContent || '');
        }
        
        // Get content
        let content = '';
        const bubbleElement = part.querySelector('span.bubble');
        if (bubbleElement) {
          content = bubbleElement.textContent || '';
        } else {
          content = part.textContent || '';
        }
        
        // Check for attachments
        const attachmentElement = part.querySelector('img');
        const hasAttachment = !!attachmentElement;
        const attachmentPath = hasAttachment 
          ? attachmentElement?.getAttribute('src') || undefined
          : undefined;
        
        messages.push({
          sender,
          recipient: isFromMe ? participants[0] : 'Me',
          timestamp,
          content,
          isFromMe,
          hasAttachment,
          attachmentPath
        });
      });
    } else {
      // Approach 2: Original approach for different HTML structure
      const messageElements = document.querySelectorAll('.message');
      
      messageElements.forEach((element) => {
        const senderElement = element.querySelector('.sender');
        const timeElement = element.querySelector('.time') || element.querySelector('.timestamp');
        const textElement = element.querySelector('.text') || element.querySelector('.bubble');
        
        if (senderElement && timeElement && textElement) {
          const sender = senderElement.textContent || 'Unknown';
          const timestamp = parseTimestamp(timeElement.textContent || '');
          const content = textElement.textContent || '';
          const isFromMe = element.classList.contains('from-me');
          
          // Check for attachments
          const attachmentElement = element.querySelector('.attachment');
          const hasAttachment = !!attachmentElement;
          const attachmentPath = hasAttachment 
            ? attachmentElement?.getAttribute('src') || undefined
            : undefined;
          
          messages.push({
            sender,
            recipient: isFromMe ? participants[0] : 'Me',
            timestamp,
            content,
            isFromMe,
            hasAttachment,
            attachmentPath
          });
        }
      });
    }
    
    // Sort messages by timestamp
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return {
      participants,
      messages
    };
  } catch (error) {
    console.error(`Error parsing iMessage file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Helper function to find parent element with a specific class
 */
function findParentWithClass(element: Element, className: string): Element | null {
  let current = element;
  while (current && current.parentElement) {
    if (current.classList.contains(className)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Parse a timestamp string into a Date object
 */
function parseTimestamp(timestampStr: string): Date {
  // Handle various timestamp formats
  try {
    // Extract date part from formats like "Mar 02, 2025 10:21:13 AM (Read by you after 20 minutes, 23 seconds)"
    const dateMatch = timestampStr.match(/([A-Za-z]+ \d+, \d+ \d+:\d+:\d+ [AP]M)/);
    if (dateMatch && dateMatch[1]) {
      return new Date(dateMatch[1]);
    }
    
    // Try parsing the whole string
    return new Date(timestampStr);
  } catch (error) {
    console.warn(`Could not parse timestamp: ${timestampStr}`);
    return new Date();
  }
}

/**
 * Process a directory of iMessage HTML files
 */
export async function processIMessageDirectory(directoryPath: string): Promise<{
  participants: string[];
  messages: IMessage[];
  files: string[];
}> {
  const files = await fs.readdir(directoryPath);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  
  const allParticipants: Set<string> = new Set();
  const allMessages: IMessage[] = [];
  
  for (const file of htmlFiles) {
    const filePath = path.join(directoryPath, file);
    try {
      const { participants, messages } = await parseIMessageFile(filePath);
      
      // Add participants to set
      participants.forEach(p => allParticipants.add(p));
      
      // Add messages to array
      allMessages.push(...messages);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  // Sort all messages by timestamp
  allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  return {
    participants: Array.from(allParticipants),
    messages: allMessages,
    files: htmlFiles
  };
} 