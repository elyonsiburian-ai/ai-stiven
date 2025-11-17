
export enum AiMode {
  Live = 'Live',
  Thinking = 'Thinking',
  Fast = 'Fast',
  Search = 'Search',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  groundingChunks?: any[];
}
