export const RETIRED_BILLING_URLS = {
  monthly: '',
  yearly: '',
} as const;

export type BillingPlan = keyof typeof RETIRED_BILLING_URLS;

export function getMercadoPagoCheckoutUrl(_plan: BillingPlan) {
  return null;
}

export function getMercadoPagoPlanId(_plan: BillingPlan) {
  return null;
}
