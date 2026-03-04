# 📋 DOCUMENTOS LEGALES — VYRA FITNESS

Este directorio contiene todos los documentos legales requeridos para lanzar VYRA en Aptoide cumpliendo GDPR y Apple/Google Store policies.

---

## 📁 Contenido

| Archivo | Propósito | Dónde usarlo |
|---------|-----------|-------------|
| **PRIVACY_POLICY.md** | Política de privacidad (GDPR Art. 9) | URL pública en app.json + link en registro |
| **TERMS_OF_SERVICE.md** | Términos de servicio | URL pública en app.json + checkbox en registro |
| **medical_disclaimers.json** | Disclaimers médicos por módulo | Modales en la app (JSON importable) |
| **README.md** (este archivo) | Guía de implementación | Instrucciones para developer |

---

## 🚀 IMPLEMENTACIÓN: PASO A PASO

### PASO 1: Hostear Política de Privacidad y ToS (GRATIS)

Tienes 3 opciones:

#### OPCIÓN A: GitHub Pages (Recomendado — GRATIS)
```bash
# 1. Crear repo público: vyra-fitness-legal
git clone https://github.com/tuusuario/vyra-fitness-legal
cd vyra-fitness-legal

# 2. Copiar archivos
cp legal/PRIVACY_POLICY.md privacy-policy.md
cp legal/TERMS_OF_SERVICE.md terms-of-service.md

# 3. Crear index.html (opcional, para navegación)
```

Luego en GitHub:
1. Settings → Pages → Enable GitHub Pages → Branch: main
2. URLs serán:
   - https://tuusuario.github.io/vyra-fitness-legal/privacy-policy
   - https://tuusuario.github.io/vyra-fitness-legal/terms-of-service

**O mejor:** Convertir a HTML (ver más abajo)

#### OPCIÓN B: Supabase Storage (GRATIS, más controlado)
```javascript
// En Supabase:
// 1. Crear bucket "legal" (público)
// 2. Subir PRIVACY_POLICY.md y TERMS_OF_SERVICE.md
// 3. URLs serán:
// https://cdn.jsdelivr.net/gh/project_url/legal/PRIVACY_POLICY.md
```

#### OPCIÓN C: Vercel/Netlify (GRATIS para 1 sitio)
Desplegar con `vercel deploy` → get URLs

---

### PASO 2: Crear HTML para Lectura en Navegador

Convertir markdown → HTML para mejor experiencia en móvil:

```bash
# Instalar pandoc
sudo apt-get install pandoc  # Linux
brew install pandoc           # macOS

# Convertir
pandoc PRIVACY_POLICY.md -o privacy-policy.html
pandoc TERMS_OF_SERVICE.md -o terms-of-service.html
```

Subir HTMLs a GitHub Pages:
- https://tuusuario.github.io/vyra-fitness-legal/privacy-policy.html
- https://tuusuario.github.io/vyra-fitness-legal/terms-of-service.html

---

### PASO 3: Integrar URLs en app.json

En `vyra-fitness/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-app-tracking-transparency"
      ]
    ],
    "extra": {
      "legalUrls": {
        "privacyPolicy": "https://tuusuario.github.io/vyra-fitness-legal/privacy-policy.html",
        "termsOfService": "https://tuusuario.github.io/vyra-fitness-legal/terms-of-service.html",
        "disclaimers": "https://raw.githubusercontent.com/tuusuario/vyra-fitness/main/legal/medical_disclaimers.json"
      }
    },
    "permission": [
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.INTERNET",
      "android.permission.ACTIVITY_RECOGNITION"
    ]
  }
}
```

---

### PASO 4: Integrar Modales de Disclaimer en la App

En `hooks/useAuth.ts` o `hooks/useLegal.ts`:

```typescript
import legalTerms from '@/legal/medical_disclaimers.json';

export function useLegalModals() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const disclaimers = legalTerms.medical_disclaimers;

  const showModuleDisclaimer = (moduleName: string) => {
    const moduleDics = disclaimers[moduleName];
    if (moduleDics?.required_acceptance) {
      // Mostrar modal Modal
      setShowDisclaimer(true);
    }
  };

  return {
    showDisclaimer,
    disclaimers,
    showModuleDisclaimer,
  };
}
```

En `app/(auth)/register.tsx`:

```typescript
export function RegisterScreen() {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const disclaimers = useLegalModals();

  return (
    <SafeScreen>
      {/* ... */}
      
      {/* Checkbox: Términos */}
      <Checkbox
        label="Acepto los términos de servicio"
        value={acceptTerms}
        onValueChange={setAcceptTerms}
      />
      
      {/* Link a ToS */}
      <Pressable onPress={() => Linking.openURL(legalUrls.termsOfService)}>
        <Text style={{ color: '#7C3AED', textDecorationLine: 'underline' }}>
          Leer términos completos
        </Text>
      </Pressable>

      {/* Checkbox: Disclaim Salud */}
      <Checkbox
        label="Entiendo que Vyra NO es dispositivo médico"
        value={acceptHealth}
        onValueChange={setAcceptHealth}
      />

      {/* Botón registro */}
      <Button
        text="Registrarse"
        disabled={!acceptTerms || !acceptHealth}
        onPress={handleRegister}
      />
    </SafeScreen>
  );
}
```

---

### PASO 5: Integrar Disclaimers Médicos para Cada Módulo

En `modules/fasting/index.tsx` — Antes de permitir protocolo 24h:

```typescript
export function FastingScreen() {
  const disclaimers = useLegalModals();
  const [accepted24h, setAccepted24h] = useState(false);

  const selectProtocol = (protocol: '16:8' | '24h' | 'OMAD') => {
    if (protocol === '24h' || protocol === 'OMAD') {
      // Mostrar modal requerido
      <Modal visible={!accepted24h}>
        <Text fontSize="lg" fontWeight="bold">
          {disclaimers.disclaimers.fasting_24h.title}
        </Text>
        <Text>{disclaimers.disclaimers.fasting_24h.content}</Text>
        <Button
          text="Aceptar y continuar"
          onPress={() => setAccepted24h(true)}
        />
      </Modal>;
      return;
    }
    
    //... resto lógica
  };

  return (
    <SafeScreen>
      {/* UI módulo */}
    </SafeScreen>
  );
}
```

---

### PASO 6: Link en Perfil/Settings

En `app/(tabs)/profile.tsx`:

```typescript
<Section title="Legal">
  <Button
    text="Política de Privacidad"
    onPress={() => Linking.openURL(legalUrls.privacyPolicy)}
  />
  <Button
    text="Términos de Servicio"
    onPress={() => Linking.openURL(legalUrls.termsOfService)}
  />
  <Button
    text="Consentimiento de Datos de Salud"
    onPress={() => showHealthConsentModal()}
  />
</Section>
```

---

## ⚖️ CHECKLIST: ANTES DE LANZAR EN APTOIDE

- [ ] **Política de Privacidad** hosteada en URL pública
  - [ ] Accesible desde navegador móvil
  - [ ] Contiene: GDPR Art. 9, 15, 16, 17, 20, 21
  - [ ] Email de contacto: privacy@vyrafitness.app

- [ ] **Términos de Servicio** hosteados en URL pública
  - [ ] Accesible desde navegador móvil
  - [ ] Contiene disclaimer médico
  - [ ] Email de contacto: legal@vyrafitness.app

- [ ] **Modales médicos** en la app
  - [ ] General disclaimer en registro
  - [ ] Fasting 24h + OMAD aviso obligatorio
  - [ ] Supplements aviso obligatorio
  - [ ] Coach IA no-medical disclaimer
  - [ ] Female cycle "no es anticonceptivo"

- [ ] **Checkboxes en registro**
  - [ ] "Acepto Términos de Servicio" (required)
  - [ ] "Acepto Política de Privacidad" (required)
  - [ ] "Consiento procesar datos de salud" (required — GDPR Art. 9)
  - [ ] "Tengo 16+ años" (required — GDPR)

- [ ] **app.json actualizado**
  - [ ] "permissions" incluye todos los sensores
  - [ ] "extra.legalUrls" tiene URLs públicas
  - [ ] versión 1.0.0 válida

- [ ] **eas.json apk profile**
  - [ ] buildType: apk
  - [ ] releaseChannel: production
  - [ ] Listo para `eas build --platform android --profile production`

- [ ] **Screenshots para Aptoide**
  - [ ] 6 screenshots en 1440x2560px (Pixel 6)
  - [ ] Mostrar: Dashboard, 3 módulos, Premium, Coach IA
  - [ ] Texto: "Rastrear salud", "Coach IA", "Gamificación"

- [ ] **Descripción en Aptoide**
  - [ ] 500 caracteres máximo
  - [ ] Incluir: "sin costo", "offline", "privacidad primero"
  - [ ] Links a privacidad y ToS

- [ ] **Compilación final**
  ```bash
  cd vyra-fitness
  eas build --platform android --profile production
  ```

---

## 📞 SOPORTE LEGAL

Si Aptoide rechaza la app por razones legales:

1. **Revisa email de Aptoide** — qué específicamente están pidiendo
2. **Actualiza documentos** según feedback
3. **Resubmit** a través de Aptoide Dev Console

**Temas comunes:**
- "Privacy policy URL no funciona" → Verificar link, debe abrir en navegador
- "No menciona derecho al olvido" → Está en PRIVACY_POLICY.md, apartado 7.3
- "Medical disclaimers faltando" → Integrar modales de disclaimers en app
- "Términos sin permiso de edad" → Agregamos "16+ años" en registro

---

## 🔗 RECURSOS

- **GDPR Oficial:** https://gdpr-info.eu/
- **GDPR Art. 9 (datos de salud especiales):** https://gdpr-info.eu/art-9-gdpr/
- **GDPR Art. 17 (derecho al olvido):** https://gdpr-info.eu/art-17-gdpr/
- **Aptoide Políticas:** https://aptoide.com/about/policies
- **React Native App Linking:** https://reactnative.dev/docs/linking

---

**©️ VYRA FITNESS — Documentos legales © 2026. Consultar asesor legal local antes de lanzar en tu jurisdicción.**

