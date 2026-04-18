export type Role = 'admin' | 'employee';

export interface UserSettings {
  theme: 'dark' | 'light' | 'neural';
  searchSortDefault: 'relevance' | 'date';
  notificationsEnabled: boolean;
  safeSearch: boolean;
  aiTone: 'professional' | 'creative' | 'technical';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  department?: string;
  createdAt?: string;
  settings?: UserSettings;
}

export type SourceType = 'wiki' | 'drive' | 'slack' | 'github' | 'web' | 'video';
export type FileType = 'pdf' | 'doc' | 'link' | 'message' | 'video';

export interface AIOverview {
  summary: string;
  keyPoints: string[];
  suggestedQuestions: string[];
}

export interface Document {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  sourceType: SourceType;
  department?: string;
  fileType?: FileType;
  updatedAt: string;
  tags?: string[];
  relevanceScore?: number; // Calculated on the fly
  thumbnail?: string; // For video results
  videoUrl?: string; // For embedded player
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  documentId: string;
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  createdAt: string;
}
