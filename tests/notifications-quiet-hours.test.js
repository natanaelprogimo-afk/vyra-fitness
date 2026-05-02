const {
  DEFAULT_NOTIFICATION_QUIET_HOUR_END,
  DEFAULT_NOTIFICATION_QUIET_HOUR_START,
  isWithinQuietHoursWindow,
} = require('../lib/notification-quiet-hours');

describe('notification quiet hours', () => {
  test('blocks times inside the default overnight window', () => {
    expect(
      isWithinQuietHoursWindow(4 * 60 + 30, DEFAULT_NOTIFICATION_QUIET_HOUR_START, DEFAULT_NOTIFICATION_QUIET_HOUR_END, true),
    ).toBe(true);
    expect(
      isWithinQuietHoursWindow(22 * 60 + 15, DEFAULT_NOTIFICATION_QUIET_HOUR_START, DEFAULT_NOTIFICATION_QUIET_HOUR_END, true),
    ).toBe(true);
  });

  test('allows times outside the default overnight window', () => {
    expect(
      isWithinQuietHoursWindow(11 * 60, DEFAULT_NOTIFICATION_QUIET_HOUR_START, DEFAULT_NOTIFICATION_QUIET_HOUR_END, true),
    ).toBe(false);
    expect(
      isWithinQuietHoursWindow(21 * 60 + 59, DEFAULT_NOTIFICATION_QUIET_HOUR_START, DEFAULT_NOTIFICATION_QUIET_HOUR_END, true),
    ).toBe(false);
  });

  test('respects the enabled flag', () => {
    expect(isWithinQuietHoursWindow(4 * 60 + 30, 22, 7, false)).toBe(false);
  });
});
