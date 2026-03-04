// ============================================================
// VYRA FITNESS — Validadores de formularios
// ============================================================

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es obligatorio.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'El email no tiene un formato válido.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es obligatoria.';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'El nombre es obligatorio.';
  if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  return null;
}

export function validateAge(age: number | null): string | null {
  if (age === null || isNaN(age)) return 'La edad es obligatoria.';
  if (age < 13) return 'Debés tener al menos 13 años para usar Vyra.';
  if (age > 120) return 'La edad ingresada no es válida.';
  return null;
}

export function validateWeight(kg: number | null): string | null {
  if (kg === null || isNaN(kg)) return null;  // Opcional
  if (kg < 20) return 'El peso mínimo es 20 kg.';
  if (kg > 500) return 'El peso ingresado no es válido.';
  return null;
}

export function validateHeight(cm: number | null): string | null {
  if (cm === null || isNaN(cm)) return null;  // Opcional
  if (cm < 50) return 'La altura mínima es 50 cm.';
  if (cm > 300) return 'La altura ingresada no es válida.';
  return null;
}

export function validateWaterAmount(ml: number): string | null {
  if (ml <= 0) return 'La cantidad debe ser mayor a 0.';
  if (ml > 5000) return 'La cantidad máxima es 5.000ml por registro.';
  return null;
}

export function validateWaterGoal(ml: number): string | null {
  if (ml < 500) return 'La meta mínima es 500ml.';
  if (ml > 10000) return 'La meta máxima es 10.000ml.';
  return null;
}

export function validateStepGoal(steps: number): string | null {
  if (steps < 1000) return 'La meta mínima es 1.000 pasos.';
  if (steps > 100000) return 'La meta máxima es 100.000 pasos.';
  return null;
}

export function validateFoodAmount(grams: number): string | null {
  if (grams <= 0) return 'La cantidad debe ser mayor a 0.';
  if (grams > 5000) return 'La cantidad máxima es 5.000g.';
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