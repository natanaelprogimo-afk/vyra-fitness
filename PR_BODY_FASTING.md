## Vyra Fasting — Frontend changes for 5:2 support

Summary
-------
- Adds UI and hook changes to support weekly `5:2` protocol: auto-start, planned days, settings validation.
- Files of interest: `hooks/useFasting.ts`, `app/modules/fasting/settings.tsx`, screens showing 5:2 cards and week summary.

Testing checklist (local / staging)
---------------------------------
1. Install dependencies and run the app in emulator.
2. In `Ajustes -> 5:2`, select exactly 2 days and set a start time; enable Auto-iniciar.
3. Confirm the days count shows `2/2` and the toggle prevents enabling auto-start without days.
4. On a day selected as 5:2, confirm the Home fasting card shows the "Hoy es tu día 5:2" card and can activate the planned session.
5. Start/complete/abandon flows should set `status` to `active`, `completed` or `interrupted` respectively in `fasting_sessions`.

Notes for reviewers
-------------------
- Hook `useFasting` includes a client-side `wouldOverlap` guard and RPC call to `check_no_overlapping_fast`.
- Backend migrations must be applied before heavy frontend QA to ensure API surfaces exist.
