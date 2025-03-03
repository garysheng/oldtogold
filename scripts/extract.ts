import path from 'path';
import { extractIdeasFromFiles } from '../lib/extractIdeas';

// Parse command line arguments
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
    iMessageDir: parsedArgs.hasOwnProperty('iMessageDir') ? parsedArgs.iMessageDir : './data/imessage',
    appleNotesDir: parsedArgs.hasOwnProperty('appleNotesDir') ? parsedArgs.appleNotesDir : './data/notes',
    skypeDir: parsedArgs.hasOwnProperty('skypeDir') ? parsedArgs.skypeDir : './data/skype',
    outputFile: parsedArgs.outputFile || './data/ideas.json',
    modelName: parsedArgs.model || 'deepseek-r1'
  };
}

// Get command line arguments
const { iMessageDir, appleNotesDir, skypeDir, outputFile, modelName } = parseArgs();

// Ensure paths are absolute
const resolveDir = (dir: string) => {
  if (dir === "") {
    return ""; // Keep empty strings as empty
  }
  return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
};
const resolvedIMessageDir = resolveDir(iMessageDir);
const resolvedAppleNotesDir = resolveDir(appleNotesDir);
const resolvedSkypeDir = resolveDir(skypeDir);
const resolvedOutputFile = resolveDir(outputFile);

// Run extraction
console.log(`Starting idea extraction process...`);
if (resolvedIMessageDir) {
  console.log(`iMessage directory: ${resolvedIMessageDir}`);
} else {
  console.log(`Skipping iMessage extraction`);
}

if (resolvedAppleNotesDir) {
  console.log(`Apple Notes directory: ${resolvedAppleNotesDir}`);
} else {
  console.log(`Skipping Apple Notes extraction`);
}

if (resolvedSkypeDir) {
  console.log(`Skype directory: ${resolvedSkypeDir}`);
} else {
  console.log(`Skipping Skype extraction`);
}

console.log(`Output file: ${resolvedOutputFile}`);
console.log(`Using model: ${modelName}`);

extractIdeasFromFiles(
  resolvedIMessageDir,
  resolvedAppleNotesDir,
  resolvedSkypeDir,
  resolvedOutputFile,
  modelName
)
  .then(result => {
    console.log('\nExtraction complete!');
    console.log(`Processed ${result.stats.totalSources} sources`);
    console.log(`Extracted ${result.stats.totalIdeas} ideas`);
    console.log(`Processing time: ${(result.stats.processingTimeMs / 1000).toFixed(2)} seconds`);
    console.log(`Results saved to ${resolvedOutputFile}`);
  })
  .catch(error => {
    console.error('Error during extraction:', error);
    process.exit(1);
  }); 