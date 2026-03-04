// ============================================================
// VYRA FITNESS — Tipos de API y respuestas
// ============================================================

// Respuesta genérica del backend Render
export interface ApiResponse<T = void> {
  success: boolean;
  data?:   T;
  error?:  string;
  message?:string;
}

// Respuesta de creación de suscripción PayPal
export interface PayPalCreateSubscriptionResponse {
  subscriptionId: string;
  approvalUrl:    string;
}

// Respuesta del webhook PayPal
export interface PayPalWebhookEvent {
  id:          string;
  event_type:  'BILLING.SUBSCRIPTION.ACTIVATED'
             | 'BILLING.SUBSCRIPTION.CANCELLED'
             | 'BILLING.SUBSCRIPTION.EXPIRED'
             | 'BILLING.SUBSCRIPTION.SUSPENDED'
             | 'BILLING.SUBSCRIPTION.PAYMENT.FAILED';
  resource:    {
    id:         string;
    status:     string;
    plan_id:    string;
    subscriber: {
      email_address: string;
      payer_id:      string;
    };
  };
  create_time: string;
}

// Estado de suscripción desde el backend
export interface SubscriptionStatusResponse {
  userId:       string;
  isPremium:    boolean;
  plan:         'monthly' | 'yearly' | null;
  status:       string;
  expiresAt:    string | null;
  trialEndsAt:  string | null;
}

// Respuesta del Coach IA
export interface CoachMessage {
  role:    'user' | 'assistant';
  content: string;
}

export interface CoachChatResponse {
  message:          string;
  tokensUsed:       number;
  remainingFree:    number | null;   // null si es Premium
  isPremium:        boolean;
}

// Petición al coach
export interface CoachChatRequest {
  message:          string;
  conversationHistory: CoachMessage[];
}

// Respuesta de foto IA (Groq Vision)
export interface PhotoLogResponse {
  items: Array<{
    name:       string;
    calories:   number;
    protein_g:  number;
    carbs_g:    number;
    fat_g:      number;
    amount_g:   number;
    confidence: number;             // 0-1
  }>;
  rawDescription: string;
}

// Respuesta de log por voz (Groq Whisper)
export interface VoiceLogResponse {
  transcription: string;
  items: Array<{
    name:       string;
    calories:   number;
    protein_g:  number;
    carbs_g:    number;
    fat_g:      number;
    amount_g:   number;
  }>;
}

// Compra en tienda via SQL function
export interface PurchaseStoreItemResponse {
  success:     boolean;
  purchase_id: string | null;
  new_balance: number | null;
  error:       string | null;
}

// Resultado de increment_xp
export interface XpResult {
  new_xp:    number;
  new_level: number;
  leveled_up:boolean;
}

// Open Food Facts API response (simplificado)
export interface OpenFoodFactsProduct {
  status:    0 | 1;                              // 0 = not found, 1 = found
  product?: {
    product_name:     string;
    brands:           string;
    nutriments: {
      'energy-kcal_100g': number;
      proteins_100g:      number;
      carbohydrates_100g: number;
      fat_100g:           number;
      fiber_100g:         number;
      sugars_100g:        number;
      sodium_100g:        number;
    };
    image_url: string;
  };
}

// Parámetros de paginación
export interface PaginationParams {
  page:    number;
  limit:   number;
  offset?: number;
}

// Rango de fechas para filtros
export interface DateRange {
  from: string;   // ISO date
  to:   string;   // ISO date
}