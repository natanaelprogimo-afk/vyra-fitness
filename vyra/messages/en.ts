import type { VyraMessageContext } from './es';

export const VYRA_MESSAGES_EN: Record<VyraMessageContext, string[]> = {
  celebration_pr: [
    'New record. That is real consistency.',
    'PR unlocked. You are on a roll.',
    'That progress shows. Keep going.',
  ],
  streak_hit: [
    'Another day in. Your streak is alive.',
    'Consistency on. Nice work today.',
    'Streak extended. Proud of you.',
  ],
  streak_lost: [
    'No worries. We restart tomorrow.',
    'One day does not define you. We go again.',
    'We reset and move forward. You are back.',
  ],
  streak_danger: [
    'Your streak is at risk. A short session today keeps it alive.',
    'We still have time. One workout protects what you already built.',
    'It does not need to be perfect. It needs to happen today.',
  ],
  level_close: [
    'You are close to the next level. One more push gets it done.',
    'Only a few XP left. Let us close something today and unlock it.',
    'The next level is in sight. Finish strong.',
  ],
  inactive_nudge: [
    'We have been a bit quiet. Let us come back with one simple action.',
    'You do not need to fix everything today. Just restart the system.',
    'A small restart still counts. Let us move.',
  ],
  recovery_low: [
    'Today calls for control. Recover well and take an easy win.',
    'Soft day. Close water, steps or sleep before pushing harder.',
    'Do not force it. Lock the basics and come back stronger tomorrow.',
  ],
  good_morning: [
    'Good morning. Today can be a great day.',
    'Good day. I am here for the first step.',
    'Ready for today? I am.',
  ],
  general: [
    'One small step, steady and clear.',
    'Today counts. Keep it simple.',
    'Consistency first. The rest follows.',
  ],
};
