import axios from 'axios';
import { IdeaExtractionResponse } from '../../types';

const OLLAMA_API_URL = 'http://localhost:11434/api';

/**
 * Check if Ollama is running and the specified model is available
 */
export async function checkOllamaStatus(modelName: string = 'deepseek-r1'): Promise<{
  running: boolean;
  modelAvailable: boolean;
  error?: string;
}> {
  try {
    // First check if Ollama is running
    const tagsResponse = await axios.get(`${OLLAMA_API_URL}/tags`);
    
    // Then check if the specific model is available
    const availableModels = tagsResponse.data.models || [];
    
    // The model name in the response might be in the format "name:latest"
    const modelAvailable = availableModels.some((model: any) => {
      const modelNameInList = model.name;
      return modelNameInList === modelName || 
             modelNameInList === `${modelName}:latest` ||
             modelNameInList.startsWith(`${modelName}:`);
    });
    
    return { 
      running: true,
      modelAvailable,
      error: modelAvailable ? undefined : `Model ${modelName} is not available. Please run 'ollama pull ${modelName}'`
    };
  } catch (error) {
    return { 
      running: false, 
      modelAvailable: false,
      error: 'Ollama is not running. Please start it with "ollama serve".' 
    };
  }
}

/**
 * Extract potential startup ideas from text using Ollama
 */
export async function extractIdeasFromText(
  text: string, 
  modelName: string = 'deepseek-r1'
): Promise<IdeaExtractionResponse[]> {
  try {
    // Check if text is too short to contain meaningful ideas
    if (text.length < 50) {
      console.log('Text is too short to extract ideas from');
      return [];
    }
    
    const prompt = `
You are an expert at identifying potential startup ideas from conversations and notes.
Analyze the following text and identify any potential startup ideas mentioned:

${text}

If you find any potential startup ideas, provide them in the following JSON format:
[
  {
    "title": "A concise, catchy title for the startup idea (max 60 chars)",
    "description": "Detailed explanation of the startup idea, describing how it works and what it offers",
    "problem": "The problem this idea solves",
    "targetAudience": "Who would benefit from this solution",
    "confidenceScore": 7, // A number from 1-10 indicating how clearly defined the idea is
    "reasoning": "Why you think this is a viable startup idea"
  }
]

Make sure to create a clear distinction between the title (which should be short and memorable) and the description (which should be comprehensive).
If no startup ideas are found, return an empty array: []
`;

    const response = await axios.post(`${OLLAMA_API_URL}/generate`, {
      model: modelName,
      prompt: prompt,
      stream: false,
    });

    const responseText = response.data.response;
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      console.log('No ideas found in the text');
      return [];
    }
    
    try {
      const ideas = JSON.parse(jsonMatch[0]) as IdeaExtractionResponse[];
      return ideas;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return [];
    }
  } catch (error) {
    console.error('Error extracting ideas:', error);
    throw error;
  }
}

/**
 * Process text in chunks to avoid token limits
 */
export async function processTextInChunks(
  text: string,
  chunkSize: number = 4000,
  modelName: string = 'deepseek-r1'
): Promise<IdeaExtractionResponse[]> {
  // Split text into chunks
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  // Process each chunk
  const allIdeas: IdeaExtractionResponse[] = [];
  for (const chunk of chunks) {
    const ideas = await extractIdeasFromText(chunk, modelName);
    allIdeas.push(...ideas);
  }
  
  return allIdeas;
} 