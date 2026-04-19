import type { VyraMessageContext } from './es';

export const VYRA_MESSAGES_EN: Record<VyraMessageContext, string[]> = {
  celebration_pr: [
    'New record. That is real progress.',
    'New PR. You are moving well.',
    'That beat last time. Keep going.',
  ],
  streak_hit: [
    'Another day in. The streak is alive.',
    'One more day of consistency.',
    'Good close today. The streak keeps going.',
  ],
  streak_lost: [
    'No worries. We come back tomorrow.',
    'One day does not erase what you built.',
    'We close this day and restart clean.',
  ],
  streak_danger: [
    'Your streak is at risk. One short action keeps it alive.',
    'We still have time. Do something simple and protect it.',
    'It does not need to be perfect. It needs to happen today.',
  ],
  inactive_nudge: [
    'We have been quiet for a few days. Let us come back easy.',
    'You do not need to fix everything today. Just restart.',
    'A small comeback still counts.',
  ],
  recovery_low: [
    'Today calls for control. Take an easy win.',
    'Soft day. Prioritize sleep, water, and lighter effort.',
    'Do not force it. Lock the basics and push better tomorrow.',
  ],
  good_morning: [
    'Good morning. One step at a time.',
    'Good morning. Today counts too.',
    'Ready for today. Let us go.',
  ],
  general: [
    'Today counts. Keep it simple.',
    'Consistency first. The rest follows.',
    'One small step is still progress.',
  ],
};
