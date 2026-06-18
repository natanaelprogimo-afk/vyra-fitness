# Temas de Vyra Fitness

La aplicación Vyra Fitness ahora soporta **8 temas diferentes** para personalizar la experiencia visual.

## Temas Disponibles

### 1. **Sistema** (Default)
- **Descripción:** Sigue automáticamente el tema configurado en el dispositivo
- **Ideal para:** Usuarios que prefieren consistencia con el sistema operativo

### 2. **Claro**
- **Descripción:** Fondo blanco con textos oscuros
- **Ideal para:** Uso en ambientes con mucha luz natural
- **Características:** Paleta de colores suave y profesional

### 3. **Oscuro**
- **Descripción:** Gris oscuro y negro con textos claros
- **Ideal para:** Uso en ambientes oscuros, reduce fatiga visual nocturna
- **Características:** Alto contraste, cómodo para largas sesiones

### 4. **Medianoche** ⭐ **[NUEVO]**
- **Descripción:** Oscuro profundo con acentos azules fríos
- **Ideal para:** Sesiones nocturnas, ambiente minimalista
- **Características:** 
  - Fondo ultra-oscuro (#050507)
  - Acentos azules calmantes
  - Bordes con toque de luz azul

### 5. **Pastel** ⭐ **[NUEVO]**
- **Descripción:** Colores suaves y relajantes
- **Ideal para:** Usuarios que prefieren una estética más amable
- **Características:**
  - Tonos beige y crema
  - Textos en marrón suave
  - Ambiente cálido y acogedor

### 6. **Bosque** ⭐ **[NUEVO]**
- **Descripción:** Verdes naturales y tonos tierra
- **Ideal para:** Conexión con la naturaleza, ambiente fresco
- **Características:**
  - Paleta verde y tierra
  - Acentos naturales
  - Ambiente sereno y saludable

### 7. **Océano** ⭐ **[NUEVO]**
- **Descripción:** Azules profundos y calmantes como el océano
- **Ideal para:** Meditación, relajación, enfoque
- **Características:**
  - Azules profundos (#0A1420)
  - Superficies degradadas acuáticas
  - Efecto calmante

### 8. **Atardecer** ⭐ **[NUEVO]**
- **Descripción:** Naranjas, rosas y tonos cálidos
- **Ideal para:** Sesiones de tarde/noche, ambiente energético
- **Características:**
  - Tonos cálidos naranjas y rosas
  - Efecto crepuscular
  - Ambiente dinámico y motivador

## Cómo Cambiar el Tema

1. Abre **Configuración**
2. Navega a **Tema** o **Apariencia**
3. Selecciona uno de los 8 temas disponibles
4. El cambio se aplica inmediatamente en toda la aplicación

## Características Técnicas

- **Persistent:** La selección se guarda automáticamente
- **System Integration:** El tema "Sistema" respeta las preferencias del dispositivo
- **Performance:** Sin impacto en el rendimiento
- **Accessibility:** Todos los temas mantienen ratios de contraste adecuados

## Especificaciones de Color

### Medianoche (midnight)
```
Base: #050507 (ultra-oscuro)
Surface 1: #0D0D11
Surface 2: #13131A
Accent: Azul frio (#64C8FF)
```

### Pastel (pastel)
```
Base: #FBF9F6 (crema suave)
Surface 1: #FFFDF9
Surface 2: #F5F2ED
Accent: Marrón suave (#C8B4A0)
```

### Bosque (forest)
```
Base: #0F1610 (verde oscuro)
Surface 1: #1A2219
Surface 2: #233024
Accent: Verde natural (#64B478)
```

### Océano (ocean)
```
Base: #0A1420 (azul profundo)
Surface 1: #132338
Surface 2: #1C3454
Accent: Azul océano (#64B4FF)
```

### Atardecer (sunset)
```
Base: #1F1012 (marrón oscuro)
Surface 1: #3D1F2A
Surface 2: #5C3B48
Accent: Naranja cálido (#FF9664)
```

## Notas de Desarrollo

- Todos los temas están definidos en `constants/colors.ts`
- Las opciones de tema están en `constants/themes.ts`
- El componente selector está en `components/settings/ThemeSelector.tsx`
- El estado se maneja en `stores/settingsStore.ts`
- La resolución se implementa en `config/colors.ts` (función `applyRuntimeColorScheme`)
