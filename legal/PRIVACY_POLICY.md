# Política de Privacidad — VYRA FITNESS
**Vigente desde: Marzo 2026**
**Última actualización: Marzo 2, 2026**

---

## 1. RESPONSABLE DEL TRATAMIENTO DE DATOS

**Nombre de la app:** VYRA FITNESS  
**Tipo:** Aplicación de salud y bienestar (Android vía Aptoide)  
**Responsable:** [Tu nombre/empresa]  
**Correo de privacidad:** privacy@vyrafitness.app  

---

## 2. DATOS QUE RECOPILAMOS

### 2.1 Datos de Identificación y Autenticación
- **Email** (requerido para registro)
- **Contraseña** (hasheada por Supabase Auth)
- **Perfil:** nombre, edad (16+), altura, peso inicial

### 2.2 Datos de Salud (Categoría Especial — GDPR Art. 9)
- **Hidratación:** volumen de agua, tipo de bebida, horarios
- **Nutrición:** comidas registradas, fotografías de comida, macronutrientes, calorías
- **Actividad:** pasos, distancia, calorías quemadas, duraciones de ejercicio
- **Peso:** registros de peso, porcentaje de grasa corporal, fotos de progreso
- **Sueño:** duración, calidad subjetiva, fases (si el dispositivo lo proporciona)
- **Ayuno:** protocolos, duraciones, fases alcanzadas
- **Salud Mental:** check-ins emocionales (ánimo, energía, estrés, motivación)
- **Salud Femenina:** ciclo menstrual, síntomas, predicciones de fase (solo si habilitado explícitamente)
- **Suplementos:** nombre, dosis, frecuencia

### 2.3 Datos de Uso de la App
- **Eventos:** acciones en la app (logueo, aperturas de módulos, completado de metas)
- **Analítica:** PostHog rastrea funnels, retención, features más usadas
- **Crashes:** Sentry reporta errores técnicos para mejorar la app
- **Monedas y gamificación:** historial de transacciones internas (VyraCoin)

### 2.4 Datos Técnicos
- **Dispositivo:** modelo, versión Android, resolución pantalla (para analytics)
- **IP Address:** registrado por Render (backend) para rate limiting — no almacenado

---

## 3. BASE LEGAL PARA PROCESAR TUS DATOS

| Tipo de datos | Base legal | Tu derecho |
|---------------|-----------|-----------|
| Autenticación, perfil | Contrato — necesario para usar la app | Acceso, rectificación |
| Datos de salud | **Consentimiento explícito** (GDPR Art. 9) | Revocación de consentimiento |
| Analytics, crashes | Interés legítimo (mejorar la app) | Oposición |
| PayPal subscription | Contrato — necesario para procesar pagos | Copia de datos |

**⚠️ IMPORTANTE:** Al registrarte en VYRA, **aceptas explícitamente** el procesamiento de datos de salud. La app no funcionará sin este consentimiento. Podés revocar tu consentimiento en cualquier momento desde Settings → Privacidad → "Gestionar consentimiento de salud".

---

## 4. CÓMO ASEGURAMOS TUS DATOS

- **JWT + Supabase Auth:** Tu sesión está protegida con tokens criptográficos (segun en expo-secure-store)
- **Base de datos:** Supabase PostgreSQL con encriptación en tránsito (TLS 1.3)
- **Fotos de progreso:** Almacenadas en Supabase Storage (bucket privado), URLs firmadas con expiración 1 hora
- **Secretos:** API keys sensibles (Groq, PayPal) **NUNCA se envían a tu dispositivo** — solo residen en el backend Render
- **Biometría opcional:** Podés activar huella dactilar/PIN con expo-local-authentication para proteger el acceso a la app

**NO usamos:**
- Google Analytics (privacidad first)
- Facebook Pixel
- Terceros para ads personalizados (Unity Ads NO rastrea identidad)

---

## 5. CON QUIÉN COMPARTIMOS TUS DATOS

| Servicio | Qué datos | Por qué | ¿Puedo optar? |
|----------|----------|---------|-------|
| **Supabase** (Canada) | Perfil, logs de salud, autenticación | DB principal | No — necesario |
| **Render** (Virginia, USA) | Requests JWT, rate limiting logs | Backend de la app | No — necesario |
| **Groq** (USA) | Tus mensajes al Coach IA | Procesar IA | Sí — no usar Coach IA |
| **PayPal** | Email, ID de suscripción (NO tarjeta) | Procesar pagos | Sí — no comprar Premium |
| **PostHog** (USA) | Eventos anónimos (no incluye datos de salud) | Analytics agregada | Sí — desactivar en Settings |
| **Sentry** (USA) | Stack traces de errores (anónimos) | Debugging | Sí — desactivar en Settings |
| **Unity Ads** (USA) | ID anónimo, events de ads | Mostrar anuncios | Sí — pagar Premium |

**Ningún tercero vende tus datos. Prohibido por contrato.**

---

## 6. RETENCIÓN DE DATOS

| Datos | Retención | Motivo |
|-------|-----------|--------|
| Logs de salud (agua, pasos, comidas, etc.) | Indefinido mientras esté activa la cuenta | Historial para gráficos y análisis |
| Fotos de progreso | Indefinido (almacenadas en tu bucket privado) | Evidencia visual del progreso |
| Transactions de monedas | 2 años | Auditoría financiera |
| Logs técnicos (Sentry, PostHog) | 30 días | Debugging y análisis de crashes |
| Backup Supabase | 7 días (automático, 1 backup/día) | Disaster recovery |

**Al eliminar tu cuenta:** Todos los datos se marcan para eliminación dentro de 30 días (GDPR Art. 17 — derecho al olvido). Los backups se purgan automáticamente después.

---

## 7. TUS DERECHOS — GDPR

### 7.1 Derecho de Acceso (Art. 15)
Podés descargar TODOS tus datos en formato JSON desde Settings → Privacidad → "Exportar mis datos".

### 7.2 Derecho de Rectificación (Art. 16)
Podés modificar tu perfil (nombre, altura, peso) en cualquier momento desde Settings. Los datos de salud históricos no se editan (inmutables para auditoría).

### 7.3 Derecho al Olvido (Art. 17) 🔴 **CRÍTICO**
Settings → Cuenta → "Eliminar mi cuenta y todos mis datos":
1. Recibís un email de confirmación con token de 24 horas
2. Confirmás desde el email
3. Tu cuenta entera se elimina en máximo 30 días
4. Confirmación final por email

### 7.4 Derecho a Limitar el Procesamiento (Art. 18)
Podés "pausar" la recopilación de analytics desde Settings → Privacidad → "Desactivar analytics".

### 7.5 Derecho a la Portabilidad (Art. 20)
Exporta tus datos en JSON (completo, incluyendo historial de logs).

### 7.6 Derecho de Oposición (Art. 21)
- **PostHog analytics:** Settings → Privacidad → "Desactivar analytics"
- **Sentry error reporting:** Settings → Privacidad → "Desactivar crash reports"
- **Notificaciones:** Settings → Notifi caciones → "No molestar"

### 7.7 Tomar Decisiones Automatizadas/Perfilado
La app NO toma decisiones legales automáticas. El Coach IA es un asistente, no una decisión vinculante.

---

## 8. TRANSFERENCIAS INTERNACIONALES

Tus datos se almacenan en:
- **Supabase:** Region Canada (cumple GDPR)
- **Render:** Virginia, USA (cumple Privacy Shield / Data Processing Agreements)
- **Groq, PostHog, Sentry:** USA (acuerdos estándar EU-USA)

Todas cumplen GDPR cláusulas 45+ (adecuación) o 46+ (salvaguardas).

---

## 9. INFORMACIÓN PARA MENORES DE 16 AÑOS

- **VYRA no es para menores de 16 años.** Al registrarte declaras que tienes ≥16.
- Si descubrimos usuarios menores, su cuenta se elimina sin preguntas.
- En EEA/GDPR: consentimiento parental obligatorio para menores de 14.

---

## 10. CAMBIOS A ESTA POLÍTICA

Si modificamos la política, te notificaremos vía:
1. In-app banner en próxima apertura
2. Email a tu dirección registrada (si es cambio importante)

**Seguir usando VYRA significa aceptar los cambios.**

---

## 11. CONTACTO

**Preguntas sobre privacidad:**
- 📧 Email: privacy@vyrafitness.app
- 🏢 Dirección: [Tu dirección]
- 📋 Respuesta en máximo 30 días (GDPR obligatorio)

**Derecho a reclamar ante autoridad:**
Si creés que violamos tu privacidad:
- 🇦🇷 Argentina: PROTEX (protex@jus.gov.ar)
- 🇪🇺 EU: Autoridad de datos local (https://edpb.europa.eu/about-edp/board/members_en)
- 🇬🇧 UK: ICO (ico.org.uk)

---

**© VYRA FITNESS — Política confidencial, no distribuir sin permiso**

