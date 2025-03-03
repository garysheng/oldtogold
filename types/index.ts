export interface Idea {
  id: string;
  title: string;
  description: string;
  problem: string;
  targetAudience: string;
  confidenceScore: number;
  reasoning?: string;
  sourceFile: string;
  sourceType: 'iMessage' | 'AppleNote' | 'Skype';
  timestamp: Date;
  participants?: string[];
  context?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Source {
  id: string;
  type: 'iMessage' | 'AppleNote' | 'Skype';
  path: string;
  filename: string;
  processed: boolean;
  processedAt?: Date;
  ideasExtracted: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  sender: string;
  recipient: string;
  timestamp: Date;
  content: string;
  isFromMe: boolean;
  hasAttachment: boolean;
  attachmentPath?: string;
}

export interface SkypeMessage {
  sender: string;
  content: string;
  timestamp: Date;
  conversationId: string;
  messageType: string;
  isFromMe: boolean;
}

export interface SkypeConversation {
  id: string;
  displayName: string;
  version: number;
  properties: {
    conversationblocked: boolean;
    lastimreceivedtime?: string;
    consumptionhorizon?: string;
    conversationstatus?: string;
  };
  threadProperties?: {
    membercount?: number;
    members?: string;
    topic?: string;
  };
  MessageList: {
    id: string;
    displayName: string | null;
    originalarrivaltime: string;
    messagetype: string;
    version: number;
    content: string;
    conversationid: string;
    from: string;
    properties: any | null;
    amsreferences: any | null;
  }[];
}

export interface AppleNote {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  filepath: string;
}

export interface ExtractionParams {
  minConfidence: number;
  includeContext: boolean;
  contextSize: number;
}

export interface IdeaExtractionResponse {
  title: string;
  description: string;
  problem: string;
  targetAudience: string;
  confidenceScore: number;
  reasoning: string;
}

export interface AppSettings {
  ollamaBaseUrl: string;
  ollamaModel: string;
  dataDirectory: string;
  extractionParams: ExtractionParams;
  darkMode: boolean;
}

export interface ProcessingStats {
  totalSourcesProcessed: number;
  totalIdeasExtracted: number;
  averageConfidenceScore: number;
  processingTimeMs: number;
  lastProcessedAt?: Date;
}

export interface IdeaFilters {
  minConfidence?: number;
  sourceType?: 'iMessage' | 'AppleNote' | 'Skype' | 'all';
  participants?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  tags?: string[];
} 