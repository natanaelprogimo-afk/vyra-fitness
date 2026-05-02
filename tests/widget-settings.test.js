const { getWidgetFocus } = require('../lib/widget-settings');

describe('widget settings compatibility', () => {
  test('maps the legacy kora widget focus to balance', () => {
    const focus = getWidgetFocus({
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 86400000).toISOString(),
      context_memory_json: { widget_focus: 'kora' },
    });

    expect(focus).toBe('balance');
  });

  test('keeps the resolved alias available for all profiles', () => {
    const focus = getWidgetFocus({
      is_premium: false,
      premium_expires_at: null,
      context_memory_json: { widget_focus: 'kora' },
    });

    expect(focus).toBe('balance');
  });
});
