# Old to Gold: Startup Idea Miner

Extract potential startup ideas from your iMessage chats, Apple Notes, and Skype conversations using local LLM processing.

## Overview

Old to Gold is a tool that helps you discover potential startup ideas hidden in your everyday conversations and notes. It uses a local LLM (Language Model) to analyze your iMessage chats, Apple Notes, and Skype conversations, identifying concepts that could be developed into business opportunities.

## Features

- **Local Processing**: All analysis happens on your machine using Ollama
- **Privacy-Focused**: Your messages and notes never leave your computer
- **Multiple Data Sources**: Process iMessage, Apple Notes, and Skype conversations
- **Simple Interface**: Clean, dark-themed UI to browse extracted ideas
- **Confidence Scoring**: Ideas are rated based on clarity and potential
- **Resumable Processing**: Extraction can be interrupted and resumed, picking up where it left off
- **Incremental Saving**: Results are saved after each file is processed to prevent data loss

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Ollama](https://ollama.ai/download) installed locally

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Ollama from [ollama.ai/download](https://ollama.ai/download)

3. Pull the DeepSeek model:
   ```bash
   ollama pull deepseek-r1
   ```

### Preparing Your Data

#### Using Example Files (For Testing)

If you want to test the application without using your personal data, you can use the example files provided in the `examples` directory:

```bash
# Run extraction using example files
npm run extract:examples
```

Or using the direct command:
```bash
npm run extract -- --iMessageDir="./examples/imessage" --appleNotesDir="./examples/notes" --skypeDir="./examples/skype" --outputFile="./examples/ideas.json" --model="deepseek-r1"
```

These example files demonstrate the expected format for each data source and can be useful for development and testing purposes.

#### iMessage Export (Recommended Method)
1. Install [imessage-exporter](https://github.com/ReagentX/imessage-exporter):
   ```bash
   brew install reagentx/formulae/imessage-exporter
   ```
2. Export your messages to HTML format:
   ```bash
   imessage-exporter -f html -o ./data/imessage
   ```
   This is the recommended and supported way to export your iMessages for free!

#### Apple Notes Export (Recommended Method)
1. Download [Exporter](https://apps.apple.com/us/app/exporter/id1099120373) from the Mac App Store (free)
2. Export your notes to markdown format:
   - Open Exporter
   - Select markdown format
   - Export to `./data/notes/`
   - The app preserves creation & modification dates and handles attachments

This is the recommended way to export your Apple Notes for free! The app is privacy-focused and doesn't collect any data.

#### Skype Export
1. Go to [Skype Data Export](https://secure.skype.com/en/data-export)
2. Log in to your Skype account
3. Request your conversation history in JSON format
4. Once you receive the export (usually by email), download and extract it
5. Create a Skype data directory:
   ```bash
   mkdir -p ./data/skype
   ```
6. Place the exported JSON file(s) in the `./data/skype` directory

### Running the App

1. **Extract ideas**:

   Using npm scripts (recommended):
   ```bash
   # Process all sources (iMessage, Apple Notes, and Skype)
   npm run extract:all
   
   # Process only Skype files
   npm run extract:skype
   
   # Process only iMessage files
   npm run extract:imessage
   
   # Process only Apple Notes files
   npm run extract:notes
   ```

   Or using direct command:
   ```bash
   npx tsx scripts/extract.ts --iMessageDir="./data/imessage" --appleNotesDir="./data/notes" --skypeDir="./data/skype" --outputFile="./data/ideas.json" --model="deepseek-r1"
   ```
   
   - The extraction process saves progress after each file
   - If interrupted, running again will resume from the last unprocessed file
   - You can safely stop and restart the process at any time

2. **View results**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Examples

The project includes an `examples` directory with sample files that demonstrate the expected format for each supported data source:

- **iMessage**: Sample HTML conversation files in `examples/imessage/`
- **Apple Notes**: Sample markdown files in `examples/notes/`
- **Skype**: Sample JSON export files in `examples/skype/`
- **ideas.json**: Sample output file showing the structure of extracted ideas

These examples can be used to test the extraction functionality without using your personal data. To run the extraction tool with the example files:

```bash
npm run extract:examples
```

Or using the direct command:
```bash
npm run extract -- --iMessageDir="./examples/imessage" --appleNotesDir="./examples/notes" --skypeDir="./examples/skype" --outputFile="./examples/ideas.json" --model="deepseek-r1"
```

After running the extraction process with example files, the `examples/ideas.json` file will contain sample extracted ideas with details including:
- Title and description
- Problem statement and target audience
- Confidence score with reasoning
- Source information and context
- Tags and timestamps

For more details about the example files, see the [examples/README.md](examples/README.md) file.

## Application Architecture

Old to Gold is built with Next.js 15+, using a combination of server and client components:

### Server Components
Server components handle data fetching and processing, running on the server and sending HTML to the client.

### Client Components
Client components (marked with `"use client"` directive) handle interactive elements that require React hooks like `useState`.

### Data Loading
The application uses the App Router API in Next.js to load the extracted ideas:
- For development and browser view: Data is loaded via API routes (`/api/ideas`)
- For extraction process: Node.js file system APIs are used in server-side scripts

> **Note:** The extraction process runs in a Node.js environment and can access the file system directly. The web UI should use API routes to access data to avoid "Module not found" errors for Node.js-specific modules like `fs/promises`.

## How It Works

1. The app parses your iMessage, Apple Notes, and Skype files
2. Text content is processed in chunks and sent to the local Ollama LLM
3. The LLM identifies potential startup ideas and evaluates them
4. Results are saved incrementally to a JSON file and displayed in the web interface

## Command Options

### Using npm Scripts

We've added convenient npm scripts to run the extraction process:

```bash
# Process all sources
npm run extract:all

# Process only Skype files
npm run extract:skype

# Process only iMessage files
npm run extract:imessage

# Process only Apple Notes files
npm run extract:notes

# Process example files (for testing)
npm run extract:examples
```

### Named Parameter Syntax

If you need more control, you can use the direct command with named parameters:

```bash
npx tsx scripts/extract.ts --iMessageDir="./data/imessage" --appleNotesDir="./data/notes" --skypeDir="./data/skype" --outputFile="./data/ideas.json" --model="deepseek-r1"
```

All parameters are optional and have the following defaults:
- `--iMessageDir`: "./data/imessage"
- `--appleNotesDir`: "./data/notes"
- `--skypeDir`: "./data/skype"
- `--outputFile`: "./data/ideas.json"
- `--model`: "deepseek-r1"

### Examples

To only process Skype files with a custom output location:
```bash
npx tsx scripts/extract.ts --iMessageDir="" --appleNotesDir="" --skypeDir="./data/skype" --outputFile="./data/skype_ideas.json" --model="deepseek-r1"
```

To use a different model:
```bash
npx tsx scripts/extract.ts --iMessageDir="./data/imessage" --appleNotesDir="./data/notes" --skypeDir="./data/skype" --outputFile="./data/ideas.json" --model="llama3"
```

## Support & Feedback

If you encounter any bugs or have feature requests, please reach out to [@garysheng](https://twitter.com/garysheng) on X (Twitter).

## License

MIT
# oldtogold
