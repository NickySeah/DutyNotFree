export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface HSCode {
  type_of_product: string;
  hs_code: string;
  hs_description: string;
}

export interface ChatResponse {
  status: string;
  query: string;
  topK: number;
  hs_codes?: HSCode[];
  error?: string;
  parsing_error?: string;
  raw_response?: string;
}