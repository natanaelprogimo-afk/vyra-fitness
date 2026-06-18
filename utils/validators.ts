// ============================================================
// VYRA FITNESS — Validadores de formularios (i18n compatible)
// ============================================================

import { getLocalizedStrings } from '@/constants/strings';

// Helper para obtener mensajes de validación traducidos
function getMessages() {
  const strings = getLocalizedStrings();
  return {
    emailRequired: 'El email es obligatorio.',
    emailInvalid: strings.ValidationMessages.emailInvalid,
    passwordRequired: strings.ValidationMessages.passwordRequired,
    passwordTooShort: strings.ValidationMessages.passwordTooShort,
    nameRequired: 'El nombre es obligatorio.',
    nameTooShort: 'El nombre debe tener al menos 2 caracteres.',
    ageRequired: 'La edad es obligatoria.',
    ageTooYoung: strings.ValidationMessages.ageTooYoung,
    ageInvalid: strings.ValidationMessages.ageInvalid,
    weightTooLow: strings.ValidationMessages.weightTooLow,
    weightInvalid: strings.ValidationMessages.weightInvalid,
    heightTooLow: strings.ValidationMessages.heightTooLow,
    heightInvalid: strings.ValidationMessages.heightInvalid,
    waterAmountZero: 'La cantidad debe ser mayor a 0.',
    waterAmountTooHigh: strings.ValidationMessages.waterAmountTooHigh,
    waterGoalTooLow: strings.ValidationMessages.waterGoalTooLow,
    waterGoalTooHigh: strings.ValidationMessages.waterGoalTooHigh,
    stepsGoalTooLow: strings.ValidationMessages.stepsGoalTooLow,
    stepsGoalTooHigh: strings.ValidationMessages.stepsGoalTooHigh,
    foodAmountZero: 'La cantidad debe ser mayor a 0.',
    foodAmountTooHigh: strings.ValidationMessages.foodAmountTooHigh,
  };
}

export function validateEmail(email: string): string | null {
  const msgs = getMessages();
  if (!email.trim()) return msgs.emailRequired;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return msgs.emailInvalid;
  return null;
}

export function validatePassword(password: string): string | null {
  const msgs = getMessages();
  if (!password) return msgs.passwordRequired;
  if (password.length < 8) return msgs.passwordTooShort;
  return null;
}

export function validateName(name: string): string | null {
  const msgs = getMessages();
  if (!name.trim()) return msgs.nameRequired;
  if (name.trim().length < 2) return msgs.nameTooShort;
  return null;
}

export function validateAge(age: number | null): string | null {
  const msgs = getMessages();
  if (age === null || isNaN(age)) return msgs.ageRequired;
  if (age < 13) return msgs.ageTooYoung;
  if (age > 120) return msgs.ageInvalid;
  return null;
}

export function validateWeight(kg: number | null): string | null {
  const msgs = getMessages();
  if (kg === null || isNaN(kg)) return null;  // Opcional
  if (kg < 20) return msgs.weightTooLow;
  if (kg > 500) return msgs.weightInvalid;
  return null;
}

export function validateHeight(cm: number | null): string | null {
  const msgs = getMessages();
  if (cm === null || isNaN(cm)) return null;  // Opcional
  if (cm < 50) return msgs.heightTooLow;
  if (cm > 300) return msgs.heightInvalid;
  return null;
}

export function validateWaterAmount(ml: number): string | null {
  const msgs = getMessages();
  if (ml <= 0) return msgs.waterAmountZero;
  if (ml > 5000) return msgs.waterAmountTooHigh;
  return null;
}

export function validateWaterGoal(ml: number): string | null {
  const msgs = getMessages();
  if (ml < 500) return msgs.waterGoalTooLow;
  if (ml > 10000) return msgs.waterGoalTooHigh;
  return null;
}

export function validateStepGoal(steps: number): string | null {
  const msgs = getMessages();
  if (steps < 1000) return msgs.stepsGoalTooLow;
  if (steps > 100000) return msgs.stepsGoalTooHigh;
  return null;
}

export function validateFoodAmount(grams: number): string | null {
  const msgs = getMessages();
  if (grams <= 0) return msgs.foodAmountZero;
  if (grams > 5000) return msgs.foodAmountTooHigh;
  return null;
}

// Validar que no es menor de 13 (GDPR)
export function isMinor(ageOrDob: number | string): boolean {
  if (typeof ageOrDob === 'number') return ageOrDob < 13;
  const dob = new Date(ageOrDob);
  const now  = new Date();
  const age  = now.getFullYear() - dob.getFullYear();
  return age < 13;
}

// Validar déficit calórico extremo
export function isExtremeDéficit(caloriesIn: number, tdee: number, gender: string): boolean {
  const limit = gender === 'female' ? 1200 : 1500;
  const deficit = tdee - caloriesIn;
  return caloriesIn < limit || deficit > 700;
}