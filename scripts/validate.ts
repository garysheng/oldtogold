import fs from 'fs/promises';
import path from 'path';
import { Idea, Source } from '../types';

async function validateIdeas(filePath: string): Promise<boolean> {
  try {
    console.log(`Validating ideas in: ${filePath}`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`Error: File not found: ${filePath}`);
      return false;
    }
    
    // Read and parse file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!data.ideas || !Array.isArray(data.ideas)) {
      console.error('Error: No ideas array found in the file');
      return false;
    }
    
    const ideas: Idea[] = data.ideas;
    console.log(`Found ${ideas.length} ideas in the file`);
    
    // Check for duplicate IDs
    const idMap = new Map<string, Idea[]>();
    const duplicateIds: string[] = [];
    
    ideas.forEach(idea => {
      if (!idea.id) {
        console.error('Error: Found idea without ID');
        return;
      }
      
      if (!idMap.has(idea.id)) {
        idMap.set(idea.id, [idea]);
      } else {
        const existingIdeas = idMap.get(idea.id) || [];
        existingIdeas.push(idea);
        idMap.set(idea.id, existingIdeas);
        if (!duplicateIds.includes(idea.id)) {
          duplicateIds.push(idea.id);
        }
      }
    });
    
    // Report duplicates
    if (duplicateIds.length > 0) {
      console.error(`Error: Found ${duplicateIds.length} duplicate IDs:`);
      duplicateIds.forEach(id => {
        const duplicates = idMap.get(id) || [];
        console.error(`  ID: ${id} appears ${duplicates.length} times`);
        duplicates.forEach((idea, index) => {
          console.error(`    ${index + 1}. Title: "${idea.title}", Source: ${idea.sourceType}, Created: ${idea.createdAt}`);
        });
      });
      return false;
    }
    
    // Check for duplicate content with different IDs
    const contentMap = new Map<string, Idea[]>();
    const duplicateContents: string[] = [];
    
    ideas.forEach(idea => {
      // Create a normalized version of the title for comparison
      const normalizedTitle = idea.title.toLowerCase().trim();
      
      if (!contentMap.has(normalizedTitle)) {
        contentMap.set(normalizedTitle, [idea]);
      } else {
        const existingIdeas = contentMap.get(normalizedTitle) || [];
        existingIdeas.push(idea);
        contentMap.set(normalizedTitle, existingIdeas);
        if (!duplicateContents.includes(normalizedTitle) && existingIdeas.length > 1) {
          duplicateContents.push(normalizedTitle);
        }
      }
    });
    
    // Report duplicate content
    if (duplicateContents.length > 0) {
      console.warn(`Warning: Found ${duplicateContents.length} ideas with duplicate titles but different IDs:`);
      duplicateContents.forEach(title => {
        const duplicates = contentMap.get(title) || [];
        console.warn(`  Title: "${title}" appears ${duplicates.length} times`);
        duplicates.forEach((idea, index) => {
          console.warn(`    ${index + 1}. ID: ${idea.id}, Source: ${idea.sourceType}, Created: ${idea.createdAt}`);
        });
      });
      // We don't fail validation for duplicate titles, just warn
    }
    
    console.log('Validation successful! No duplicate IDs found.');
    return true;
  } catch (error) {
    console.error('Error during validation:', error);
    return false;
  }
}

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsedArgs: Record<string, string> = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (key && value !== undefined) {
        parsedArgs[key] = value;
      }
    }
  });
  
  return {
    ideasFile: parsedArgs.ideasFile || './data/ideas.json'
  };
}

// Main function
async function main() {
  const { ideasFile } = parseArgs();
  const resolvedIdeasFile = path.isAbsolute(ideasFile) 
    ? ideasFile 
    : path.resolve(process.cwd(), ideasFile);
  
  const isValid = await validateIdeas(resolvedIdeasFile);
  
  if (!isValid) {
    process.exit(1); // Exit with error code
  }
}

// Run the validation
main(); 