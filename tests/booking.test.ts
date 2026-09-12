import { describe, expect, it } from 'vitest';

import {
  BOOKING_WINDOW_DAYS,
  MAX_NOTE_LENGTH,
  MAX_OWNER_NAME_LENGTH,
  TIME_SLOTS,
  addDays,
  buildBookingRequest,
  diffInCalendarDays,
  isBookableDate,
  isSlotWithinBusinessHours,
  isValidPhone,
  normalizePhone,
  parseDateOnly,
  parseTimeSlot,
  toDateKey,
  validateBooking,
  type BookingFormInput,
} from '../lib/booking';
import { STORE_INFO } from '../lib/store';

/** 固定一个“今天”，这样测试不会因为哪天跑而时好时坏 */
const TODAY = new Date(2026, 4, 20); // 2026-05-20

function validInput(overrides: Partial<BookingFormInput> = {}): BookingFormInput {
  return {
    ownerName: '陈女士',
    phone: '13800138000',
    petType: '小型犬',
    service: '基础香波洗护',
    date: '2026-05-25',
    timeSlot: '10:00 - 12:00',
    note: '',
    ...overrides,
  };
}

describe('手机号处理', () => {
  it('去掉空格、横线和括号', () => {
    expect(normalizePhone('138 0013 8000')).toBe('13800138000');
    expect(normalizePhone('021-1234-5678')).toBe('02112345678');
    expect(normalizePhone('(021) 12345678')).toBe('02112345678');
  });

  it('把全角数字转成半角数字', () => {
    expect(normalizePhone('１３８００１３８０００')).toBe('13800138000');
  });

  it('空值返回空字符串，不会报错', () => {
    expect(normalizePhone(undefined)).toBe('');
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone('   ')).toBe('');
  });

  it('接受 11 位手机号', () => {
    expect(isValidPhone('13800138000')).toBe(true);
    expect(isValidPhone('19912345678')).toBe(true);
    expect(isValidPhone('138 0013 8000')).toBe(true);
  });

  it('接受带区号的固定电话', () => {
    expect(isValidPhone('021-12345678')).toBe(true);
    expect(isValidPhone('01012345678')).toBe(true);
  });

  it('拒绝明显不对的号码', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('1380013800')).toBe(false); // 只有 10 位
    expect(isValidPhone('12800138000')).toBe(false); // 第二位不合法
    expect(isValidPhone('138001380001')).toBe(false); // 12 位
    expect(isValidPhone('abcdefghijk')).toBe(false);
  });

  it('门店自己的 400 热线不算客人电话', () => {
    expect(isValidPhone(STORE_INFO.hotline)).toBe(false);
  });
});

describe('日期处理', () => {
  it('能格式化出补零的日期字符串', () => {
    expect(toDateKey(new Date(2026, 4, 20))).toBe('2026-05-20');
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('严格解析 YYYY-MM-DD', () => {
    expect(parseDateOnly('2026-05-20')).toEqual(new Date(2026, 4, 20));
    expect(parseDateOnly('2024-02-29')).toEqual(new Date(2024, 1, 29)); // 闰年
  });

  it('不存在的日期返回 null，而不是悄悄滚到下个月', () => {
    expect(parseDateOnly('2026-02-30')).toBeNull();
    expect(parseDateOnly('2026-13-01')).toBeNull();
    expect(parseDateOnly('2026-04-31')).toBeNull();
  });

  it('格式不对返回 null', () => {
    expect(parseDateOnly('2026/05/20')).toBeNull();
    expect(parseDateOnly('20260520')).toBeNull();
    expect(parseDateOnly('2026-5-20')).toBeNull();
    expect(parseDateOnly('')).toBeNull();
    expect(parseDateOnly(undefined)).toBeNull();
  });

  it('能算出两个日期相差几天', () => {
    expect(diffInCalendarDays(new Date(2026, 4, 20), new Date(2026, 4, 20))).toBe(0);
    expect(diffInCalendarDays(new Date(2026, 4, 25), new Date(2026, 4, 20))).toBe(5);
    expect(diffInCalendarDays(new Date(2026, 4, 19), new Date(2026, 4, 20))).toBe(-1);
    expect(diffInCalendarDays(new Date(2026, 5, 1), new Date(2026, 4, 31))).toBe(1);
  });

  it('跨月跨年加天数正确', () => {
    expect(toDateKey(addDays(new Date(2026, 4, 31), 1))).toBe('2026-06-01');
    expect(toDateKey(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01');
  });
});

describe('可预约日期 isBookableDate', () => {
  it('今天和预约窗口内的日期都可以预约', () => {
    expect(isBookableDate('2026-05-20', TODAY)).toBe(true); // 今天
    expect(isBookableDate('2026-05-21', TODAY)).toBe(true);
    expect(isBookableDate('2026-07-19', TODAY)).toBe(true); // 第 60 天，刚好在窗口内
  });

  it('昨天不行，第 61 天也不行', () => {
    expect(isBookableDate('2026-05-19', TODAY)).toBe(false);
    expect(isBookableDate('2026-07-20', TODAY)).toBe(false);
  });

  it('窗口边界和常量对得上', () => {
    expect(isBookableDate(toDateKey(addDays(TODAY, BOOKING_WINDOW_DAYS)), TODAY)).toBe(true);
    expect(isBookableDate(toDateKey(addDays(TODAY, BOOKING_WINDOW_DAYS + 1)), TODAY)).toBe(false);
  });

  it('乱填的日期一律不行', () => {
    expect(isBookableDate('', TODAY)).toBe(false);
    expect(isBookableDate('下周三', TODAY)).toBe(false);
    expect(isBookableDate('2026-02-30', TODAY)).toBe(false);
  });
});

describe('营业时间处理', () => {
  it('能拆出时段的起止时间', () => {
    expect(parseTimeSlot('10:00 - 12:00')).toEqual({ startMinutes: 600, endMinutes: 720 });
    expect(parseTimeSlot('09:30-20:30')).toEqual({ startMinutes: 570, endMinutes: 1230 });
  });

  it('格式不对或者结束早于开始的时段返回 null', () => {
    expect(parseTimeSlot('10:00')).toBeNull();
    expect(parseTimeSlot('12:00 - 10:00')).toBeNull();
    expect(parseTimeSlot('10:00 - 10:00')).toBeNull();
    expect(parseTimeSlot('25:00 - 26:00')).toBeNull();
  });

  it('表单里所有时段都落在营业时间内', () => {
    for (const slot of TIME_SLOTS) {
      expect(isSlotWithinBusinessHours(slot)).toBe(true);
    }
  });

  it('超出营业时间的时段被拒绝', () => {
    expect(isSlotWithinBusinessHours('09:00 - 10:00')).toBe(false); // 早于 09:30 开门
    expect(isSlotWithinBusinessHours('20:00 - 21:00')).toBe(false); // 晚于 20:30 关门
    expect(isSlotWithinBusinessHours('10:00')).toBe(false);
  });

  it('正好是营业时间的两端也算合法', () => {
    expect(isSlotWithinBusinessHours(`${STORE_INFO.openTime} - ${STORE_INFO.closeTime}`)).toBe(true);
  });
});

describe('表单校验 validateBooking', () => {
  it('填写完整时通过，没有任何错误提示', () => {
    const result = validateBooking(validInput(), { today: TODAY });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('备注可以不填', () => {
    expect(validateBooking(validInput({ note: undefined }), { today: TODAY }).valid).toBe(true);
  });

  it('主人称呼不能空着，也不能太长', () => {
    expect(validateBooking(validInput({ ownerName: '' }), { today: TODAY }).errors.ownerName).toBe(
      '请填写主人称呼',
    );
    expect(
      validateBooking(validInput({ ownerName: '   ' }), { today: TODAY }).errors.ownerName,
    ).toBe('请填写主人称呼');

    const tooLong = '很'.repeat(MAX_OWNER_NAME_LENGTH + 1);
    expect(
      validateBooking(validInput({ ownerName: tooLong }), { today: TODAY }).errors.ownerName,
    ).toBe(`主人称呼请控制在 ${MAX_OWNER_NAME_LENGTH} 个字以内`);

    const justRight = '很'.repeat(MAX_OWNER_NAME_LENGTH);
    expect(validateBooking(validInput({ ownerName: justRight }), { today: TODAY }).valid).toBe(true);
  });

  it('联系电话必须填而且格式要对', () => {
    expect(validateBooking(validInput({ phone: '' }), { today: TODAY }).errors.phone).toBe(
      '请填写联系电话',
    );
    expect(validateBooking(validInput({ phone: '123' }), { today: TODAY }).errors.phone).toBe(
      '请填写 11 位手机号，或带区号的固定电话',
    );
    expect(validateBooking(validInput({ phone: '021-12345678' }), { today: TODAY }).valid).toBe(true);
  });

  it('宠物类型和服务必须从下拉框里选', () => {
    expect(validateBooking(validInput({ petType: '' }), { today: TODAY }).errors.petType).toBe(
      '请选择宠物类型',
    );
    expect(validateBooking(validInput({ petType: '兔子' }), { today: TODAY }).errors.petType).toBe(
      '请选择宠物类型',
    );
    expect(validateBooking(validInput({ service: '' }), { today: TODAY }).errors.service).toBe(
      '请选择预约服务',
    );
    expect(validateBooking(validInput({ service: '洗澡' }), { today: TODAY }).errors.service).toBe(
      '请选择预约服务',
    );
  });

  it('日期要分别处理：没填、格式错、日期不存在、太早、太晚', () => {
    expect(validateBooking(validInput({ date: '' }), { today: TODAY }).errors.date).toBe(
      '请选择期望日期',
    );
    expect(validateBooking(validInput({ date: '2026/05/25' }), { today: TODAY }).errors.date).toBe(
      '日期格式应为 YYYY-MM-DD',
    );
    expect(validateBooking(validInput({ date: '2026-02-30' }), { today: TODAY }).errors.date).toBe(
      '请填写真实存在的日期',
    );
    expect(validateBooking(validInput({ date: '2026-05-19' }), { today: TODAY }).errors.date).toBe(
      '期望日期不能早于今天',
    );
    expect(validateBooking(validInput({ date: '2026-07-20' }), { today: TODAY }).errors.date).toBe(
      `最多只能预约 ${BOOKING_WINDOW_DAYS} 天以内的档期`,
    );
  });

  it('时段必须正好是表单里的选项', () => {
    expect(
      validateBooking(validInput({ timeSlot: '10:00-12:00' }), { today: TODAY }).errors.timeSlot,
    ).toBe('请选择期望时段');
    expect(
      validateBooking(validInput({ timeSlot: '21:00 - 23:00' }), { today: TODAY }).errors.timeSlot,
    ).toBe('请选择期望时段');
  });

  it('备注太长会被拦住', () => {
    const tooLong = '字'.repeat(MAX_NOTE_LENGTH + 1);
    expect(validateBooking(validInput({ note: tooLong }), { today: TODAY }).errors.note).toBe(
      `备注请控制在 ${MAX_NOTE_LENGTH} 个字以内`,
    );
    const justRight = '字'.repeat(MAX_NOTE_LENGTH);
    expect(validateBooking(validInput({ note: justRight }), { today: TODAY }).valid).toBe(true);
  });

  it('一次把所有问题都指出来，用户不用改一个提交一次', () => {
    const result = validateBooking(
      {
        ownerName: '',
        phone: '',
        petType: '',
        service: '',
        date: '',
        timeSlot: '',
      },
      { today: TODAY },
    );
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual([
      'date',
      'ownerName',
      'petType',
      'phone',
      'service',
      'timeSlot',
    ]);
  });

  it('不传“今天”就用系统当天，不会崩', () => {
    // 这里不能用写死的日期，否则测试会随着时间推移自己坏掉，
    // 所以按系统当天算出“明天”。
    const tomorrow = toDateKey(addDays(new Date(), 1));
    const result = validateBooking(validInput({ date: tomorrow }));
    expect(result.valid).toBe(true);
  });
});

describe('整理预约数据 buildBookingRequest', () => {
  it('校验通过时返回清理好的数据', () => {
    const result = buildBookingRequest(
      validInput({ ownerName: '  陈女士  ', phone: '138 0013 8000', note: '  怕吹风  ' }),
      { today: TODAY },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.request.ownerName).toBe('陈女士');
    expect(result.request.phone).toBe('13800138000');
    expect(result.request.note).toBe('怕吹风');
    expect(result.request.petType).toBe('小型犬');
    expect(result.request.service).toBe('基础香波洗护');
    expect(result.request.date).toBe('2026-05-25');
    expect(result.request.timeSlot).toBe('10:00 - 12:00');
  });

  it('顺手带上参考报价', () => {
    const result = buildBookingRequest(validInput({ petType: '猫咪' }), {
      today: TODAY,
      pricing: { weightKg: 12, mattedLevel: 'light', addOns: ['剪指甲'] },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    // 猫咪基础香波洗护 128 + 体重 20 + 打结 30 + 剪指甲 19 = 197
    expect(result.request.estimate.basePrice).toBe(128);
    expect(result.request.estimate.subtotal).toBe(197);
    expect(result.request.estimate.total).toBe(197);
  });

  it('会员折扣会体现在报价里', () => {
    const result = buildBookingRequest(validInput({ petType: '小型犬' }), {
      today: TODAY,
      pricing: { membership: 'gold' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    // 98 元打 9 折，优惠 10 元（9.8 四舍五入）
    expect(result.request.estimate.discountAmount).toBe(10);
    expect(result.request.estimate.total).toBe(88);
  });

  it('校验不通过时不返回数据，只返回错误', () => {
    const result = buildBookingRequest(validInput({ phone: '123', date: '2026-01-01' }), {
      today: TODAY,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.errors.phone).toBeDefined();
    expect(result.errors.date).toBe('期望日期不能早于今天');
    expect('request' in result).toBe(false);
  });
});
