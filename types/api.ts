// ============================================================
// VYRA FITNESS - Tipos de API y respuestas
// ============================================================

// Respuesta generica del backend Render
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Respuesta de creacion de suscripcion PayPal
export interface PayPalCreateSubscriptionResponse {
  subscriptionId: string;
  approvalUrl: string;
}

// Respuesta del webhook PayPal
export interface PayPalWebhookEvent {
  id: string;
  event_type:
    | 'BILLING.SUBSCRIPTION.ACTIVATED'
    | 'BILLING.SUBSCRIPTION.CANCELLED'
    | 'BILLING.SUBSCRIPTION.EXPIRED'
    | 'BILLING.SUBSCRIPTION.SUSPENDED'
    | 'BILLING.SUBSCRIPTION.PAYMENT.FAILED';
  resource: {
    id: string;
    status: string;
    plan_id: string;
    subscriber: {
      email_address: string;
      payer_id: string;
    };
  };
  create_time: string;
}

// Estado de suscripcion desde el backend
export interface SubscriptionStatusResponse {
  userId: string;
  isPremium: boolean;
  plan: 'monthly' | 'yearly' | null;
  status: string;
  expiresAt: string | null;
  trialEndsAt: string | null;
}

// Respuesta de IA contextual
export interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ContextChatResponse {
  message: string;
  tokensUsed: number;
  remainingFree: number | null;
  isPremium: boolean;
}

// Peticion de IA contextual
export interface ContextChatRequest {
  message: string;
  conversationHistory: ContextMessage[];
}

// Respuesta de foto IA
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

// Respuesta de log por voz
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

// Open Food Facts API response (simplificado)
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

// Parametros de paginacion
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

// Rango de fechas para filtros
export interface DateRange {
  from: string;
  to: string;
}
