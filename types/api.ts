// ============================================================
// VYRA FITNESS - Tipos de API y respuestas activas
// ============================================================

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ContextChatResponse {
  message: string;
  tokensUsed: number;
  remainingFree: number | null;
}

export interface ContextChatRequest {
  message: string;
  conversationHistory: ContextMessage[];
}

export interface PhotoLogResponse {
  items: Array<{
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    amount_g: number;
    confidence: number;
  }>;
  rawDescription: string;
}

export interface VoiceLogResponse {
  transcription: string;
  items: Array<{
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    amount_g: number;
  }>;
}

export interface OpenFoodFactsProduct {
  status: 0 | 1;
  product?: {
    product_name: string;
    brands: string;
    nutriments: {
      'energy-kcal_100g': number;
      proteins_100g: number;
      carbohydrates_100g: number;
      fat_100g: number;
      fiber_100g: number;
      sugars_100g: number;
      sodium_100g: number;
    };
    image_url: string;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface DateRange {
  from: string;
  to: string;
}
