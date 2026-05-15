export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  isError?: boolean;
}

export interface ChatApiResponse {
  reply: string;
  timestamp: string;
  model?: string;
}

export interface ChatApiError {
  statusCode: number;
  message: string;
  error: string;
}