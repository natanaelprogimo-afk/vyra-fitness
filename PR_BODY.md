Título: Consolidaciones y limpieza según vyra_audit_report

Descripción breve
------------------
Aplica las consolidaciones recomendadas por la auditoría dentro del frontend `vyra-fitness`: redirecciones a rutas canónicas, inlines, UI conservadora y mejoras de navegación.

Cambios principales
-------------------
- Consolidación de pantallas duplicadas y redirecciones (premium, water, settings, shop, intelligence).
- Reducción del onboarding y avance directo al finish en casos simples.
- Añadido `FeaturedModule` en Home para personalización por `profile.goal`.
- Conversión de `rest-timer` y `daily-summary` a overlays bottom-sheet/modal.
- Consolidación dentro de `modules/workout`: nueva pantalla `insights` que agrupa `Historial` / `Estadísticas` / `Records` y redirecciones de `prs`, `stats`, `history`.
- Añadido workflow de CI mínimo, scripts `typecheck`/`lint`/`test` (placeholder) y configuraciones básicas de lint/format.

Checklist para reviewers
-------------------------
- [ ] Ejecutar CI y verificar que `typecheck` pase (ya pasa localmente en mi entorno).
- [ ] Probar los flujos críticos en emulador: onboarding reducido, iniciar sesión, iniciar sesión libre, iniciar entreno, rest-timer, daily-summary.
- [ ] Revisar consolidación de `workout/insights` y confirmar que la UX esperada esté alineada (si se requiere, agendar revisión de diseño para merge profundo de `routine-builder`/`routine-templates`).
- [ ] Validar paywall/compra (si es posible en ambiente de staging).

Notas técnicas
---------------
- Ejecutar localmente:
  - `npm install`
  - `npm run typecheck`
  - `npm run lint` (placeholder; ESLint configurado pero dependencias deberán instalarse)
  - `npm run test` (placeholder hasta añadir tests reales)

Referencias
----------
- Archivo de auditoría y estado de implementación: `docs/vyra_audit_actions.txt`
