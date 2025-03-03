import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';
import { processTextInChunks } from '../lib/llm/ollamaService';

async function testExtraction() {
  try {
    // Path to the specific file
    const filePath = path.resolve(process.cwd(), 'data/imessage/+13104977737.html');
    console.log(`Testing extraction on file: ${filePath}`);
    
    // Read the file
    const content = await fs.readFile(filePath, 'utf-8');
    console.log('File read successfully');
    
    // Parse HTML
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Extract message content directly
    const messageParts = document.querySelectorAll('.message_part');
    let messageTexts: string[] = [];
    
    messageParts.forEach(part => {
      const bubbles = part.querySelectorAll('.bubble');
      if (bubbles.length > 0) {
        bubbles.forEach(bubble => {
          messageTexts.push(bubble.textContent || '');
        });
      } else {
        // If no bubble elements, get all text content
        messageTexts.push(part.textContent || '');
      }
    });
    
    // Log the extracted messages
    console.log('Extracted messages:');
    messageTexts.forEach((text, i) => {
      console.log(`Message ${i + 1}: ${text}`);
    });
    
    // Process with LLM
    console.log('\nProcessing with LLM...');
    const allText = messageTexts.join('\n');
    const ideas = await processTextInChunks(allText, 4000, 'deepseek-r1');
    
    // Log results
    console.log('\nExtracted ideas:');
    console.log(JSON.stringify(ideas, null, 2));
    
    return ideas;
  } catch (error) {
    console.error('Error in test extraction:', error);
    throw error;
  }
}

// Run the test
testExtraction()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 