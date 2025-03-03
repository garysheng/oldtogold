# OldToGold Example Files

This directory contains example files that demonstrate the expected format for each data source that the OldToGold idea extraction tool can process.

## Directory Structure

- `imessage/` - Contains example iMessage HTML export files
- `notes/` - Contains example Apple Notes markdown files
- `skype/` - Contains example Skype JSON export files
- `ideas.json` - An example output file showing the structure of extracted ideas

## Using These Examples

These examples can be used for:

1. **Testing**: You can use these files to test the extraction functionality without using your personal data.
2. **Development**: When adding new features or fixing bugs, these files provide a consistent test case.
3. **Understanding**: These files help new developers understand the expected format of each data source.

## Running Extraction with Example Files

To run the extraction tool with these example files, use the following command:

```bash
npm run extract:examples
```

Or the longer version:

```bash
npm run extract -- --iMessageDir="./examples/imessage" --appleNotesDir="./examples/notes" --skypeDir="./examples/skype" --outputFile="./examples/ideas.json" --model="deepseek-r1"
```

## File Format Details

### iMessage (HTML)

iMessage exports are HTML files containing conversation history. Each conversation file includes:
- Conversation metadata (participants, timestamps)
- Messages (sent and received)
- Message content and attachments

### Apple Notes (Markdown)

Apple Notes exports are markdown files with:
- A title (usually prefixed with the date)
- Note content including text, lists, and basic formatting

### Skype (JSON)

Skype exports are JSON files containing:
- User information
- Conversation metadata
- Messages with timestamps, content, and sender information
- Different message types (text, calls, system messages)

### ideas.json (Output)

The `ideas.json` file demonstrates the output format of the extraction process. It contains:

- An array of `ideas` objects, each representing an extracted idea with:
  - Unique ID (`id`)
  - Title (`title`) and description (`description`)
  - Problem statement (`problem`) - What issue the idea solves
  - Target audience (`targetAudience`) - Who would benefit from this idea
  - Confidence score (`confidenceScore`) - Numerical rating of the idea's potential
  - Reasoning (`reasoning`) - Explanation for the confidence score
  - Source information
    - `sourceFile` - Path to the original source file
    - `sourceType` - Type of the source (iMessage, AppleNote, Skype)
  - Context (`context`) - Snippet of the original text where the idea was extracted
  - Extraction timestamp (`timestamp`)
  - Creation and update timestamps (`createdAt`, `updatedAt`)
  - Tags (`tags`) - Array of relevant keywords or categories

- An array of `sources` objects, each representing a processed file with:
  - Unique ID (`id`)
  - File type (`type`), path (`path`), and name (`filename`)
  - Processing status (`processed`) - Boolean indicating if the file has been processed
  - Number of ideas extracted (`ideasExtracted`)
  - Timestamps (`createdAt`, `updatedAt`, `processedAt`)

This structure allows for easy tracking of extracted ideas along with their source files and processing history, making it ideal for browsing and filtering in the web interface. 