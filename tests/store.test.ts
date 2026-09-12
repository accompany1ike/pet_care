import { describe, expect, it } from 'vitest';

import { STORE_INFO, getHotlineHref, isOpenOnWeekday } from '../lib/store';

describe('门店信息', () => {
  it('关键信息都是非空文本', () => {
    for (const [key, value] of Object.entries(STORE_INFO)) {
      if (typeof value === 'string') {
        expect(value.trim(), `${key} 不应该为空`).not.toBe('');
      }
    }
  });

  it('营业时间格式是 HH:MM，而且关门晚于开门', () => {
    expect(STORE_INFO.openTime).toMatch(/^\d{2}:\d{2}$/);
    expect(STORE_INFO.closeTime).toMatch(/^\d{2}:\d{2}$/);
    expect(STORE_INFO.closeTime > STORE_INFO.openTime).toBe(true);
  });

  it('热线能转成可点击的 tel: 链接', () => {
    expect(getHotlineHref()).toBe('tel:4008821024');
  });

  it('周一至周日都营业', () => {
    for (const weekday of [0, 1, 2, 3, 4, 5, 6]) {
      expect(isOpenOnWeekday(weekday)).toBe(true);
    }
  });

  it('星期取值不合法时报错', () => {
    expect(() => isOpenOnWeekday(7)).toThrow('星期必须是 0-6 的整数');
    expect(() => isOpenOnWeekday(-1)).toThrow('星期必须是 0-6 的整数');
    expect(() => isOpenOnWeekday(1.5)).toThrow('星期必须是 0-6 的整数');
  });
});
