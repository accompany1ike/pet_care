/**
 * 泡泡爪宠物洗护店 —— 预约表单校验
 *
 * 首页的预约表单目前是静态演示（按钮是 type="button"，点一下什么都不会发生）。
 * 这个文件先把“提交前该检查什么”写成纯函数，等真正接后端接口时，
 * 前端表单和后端接口可以共用同一套规则，避免两边判断不一致。
 *
 * 所有函数都是纯函数，并且把“今天”当成参数传进来，
 * 这样单元测试不会因为运行日期不同而时好时坏。
 */

import {
  isBookingService,
  isPetType,
  estimatePrice,
  type BookingService,
  type MattedLevel,
  type MembershipTier,
  type PetType,
  type PriceEstimate,
  type AddOnName,
} from './pricing';
import { STORE_INFO } from './store';

/** 表单里的期望时段，和 app/page.tsx 的下拉框选项保持一致 */
export const TIME_SLOTS = [
  '10:00 - 12:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
  '17:00 - 19:00',
] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

/** 最多可以提前多少天预约 */
export const BOOKING_WINDOW_DAYS = 60;
/** 主人称呼最大长度 */
export const MAX_OWNER_NAME_LENGTH = 20;
/** 备注最大长度 */
export const MAX_NOTE_LENGTH = 200;

/** 预约表单提交上来的原始数据，未做任何清理 */
export type BookingFormInput = {
  ownerName: string;
  phone: string;
  petType: string;
  service: string;
  date: string;
  timeSlot: string;
  note?: string;
};

/** 逐字段的错误提示，键是字段名，值是给用户看的中文提示 */
export type BookingErrors = Partial<Record<keyof BookingFormInput, string>>;

export type ValidationResult = {
  valid: boolean;
  errors: BookingErrors;
};

// ---------------------------------------------------------------------------
// 手机号处理
// ---------------------------------------------------------------------------

/** 把全角数字（１２３）换成半角数字（123） */
function toHalfWidthDigits(value: string): string {
  return value.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  );
}

/**
 * 清理用户输入的手机号：去掉空格、横线、括号，并把全角数字转成半角。
 * 这样“138 0013 8000”“021-1234-5678”都能被正常识别。
 */
export function normalizePhone(raw: string | undefined): string {
  if (!raw) {
    return '';
  }
  return toHalfWidthDigits(raw).replace(/[\s\-()（）·]/g, '');
}

/**
 * 判断是不是可用的联系电话。
 * 接受两类：11 位中国大陆手机号，或者带区号的固定电话。
 * 注意 400 开头的门店热线不算客人电话，所以会被判为不合法。
 */
export function isValidPhone(raw: string | undefined): boolean {
  const phone = normalizePhone(raw);
  if (/^1[3-9]\d{9}$/.test(phone)) {
    return true;
  }
  return /^0\d{2,3}\d{7,8}$/.test(phone);
}

// ---------------------------------------------------------------------------
// 日期处理
// ---------------------------------------------------------------------------

/** 把日期归零到当天 00:00，方便只按“天”比较 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 把 Date 转成 YYYY-MM-DD 字符串 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 严格解析 YYYY-MM-DD。格式不对或者日期不存在（例如 2026-02-30）都返回 null。
 * 这里不用 new Date("2026-02-30")，因为 JS 会把它悄悄滚到 3 月 2 日。
 */
export function parseDateOnly(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

/** 两个日期相差几个自然日，后面的减前面的 */
export function diffInCalendarDays(target: Date, from: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(target).getTime() - startOfDay(from).getTime()) / millisecondsPerDay);
}

/** 在某个日期上加若干天，返回新的 Date */
export function addDays(date: Date, days: number): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** 可预约的最后一天（含当天） */
export function getLatestBookableDate(today: Date): Date {
  return addDays(today, BOOKING_WINDOW_DAYS);
}

/**
 * 判断某个日期字符串能不能预约：必须是真实日期、不能是过去、不能超过预约窗口。
 */
export function isBookableDate(dateKey: string, today: Date): boolean {
  const target = parseDateOnly(dateKey);
  if (!target) {
    return false;
  }
  const offset = diffInCalendarDays(target, today);
  return offset >= 0 && offset <= BOOKING_WINDOW_DAYS;
}

// ---------------------------------------------------------------------------
// 营业时间处理
// ---------------------------------------------------------------------------

/** 把 "09:30" 这样的时间文本转成从 0 点开始的分钟数，格式不对返回 null */
export function parseClockTime(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/** 把 "10:00 - 12:00" 拆成起止分钟数，格式不对返回 null */
export function parseTimeSlot(
  slot: string,
): { startMinutes: number; endMinutes: number } | null {
  const match = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/.exec(slot);
  if (!match) {
    return null;
  }
  const startMinutes = parseClockTime(match[1]);
  const endMinutes = parseClockTime(match[2]);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }
  return { startMinutes, endMinutes };
}

/**
 * 判断某个时段是不是落在门店营业时间内。
 * 营业时间是 09:30 - 20:30，所以时段必须整段落在里面。
 */
export function isSlotWithinBusinessHours(slot: string): boolean {
  const parsed = parseTimeSlot(slot);
  const opensAt = parseClockTime(STORE_INFO.openTime);
  const closesAt = parseClockTime(STORE_INFO.closeTime);
  if (!parsed || opensAt === null || closesAt === null) {
    return false;
  }
  return parsed.startMinutes >= opensAt && parsed.endMinutes <= closesAt;
}

// ---------------------------------------------------------------------------
// 表单校验
// ---------------------------------------------------------------------------

/**
 * 校验整张预约表单，返回每个字段的错误提示。
 * 一次性把所有问题都收集出来，用户可以一次改完，而不用提交一次改一个。
 */
export function validateBooking(
  input: BookingFormInput,
  options: { today?: Date } = {},
): ValidationResult {
  const today = options.today ?? new Date();
  const errors: BookingErrors = {};

  const ownerName = (input.ownerName ?? '').trim();
  if (ownerName.length === 0) {
    errors.ownerName = '请填写主人称呼';
  } else if (ownerName.length > MAX_OWNER_NAME_LENGTH) {
    errors.ownerName = `主人称呼请控制在 ${MAX_OWNER_NAME_LENGTH} 个字以内`;
  }

  const phone = normalizePhone(input.phone);
  if (phone.length === 0) {
    errors.phone = '请填写联系电话';
  } else if (!isValidPhone(input.phone)) {
    errors.phone = '请填写 11 位手机号，或带区号的固定电话';
  }

  if (!isPetType(input.petType ?? '')) {
    errors.petType = '请选择宠物类型';
  }

  if (!isBookingService(input.service ?? '')) {
    errors.service = '请选择预约服务';
  }

  const rawDate = (input.date ?? '').trim();
  if (rawDate.length === 0) {
    errors.date = '请选择期望日期';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    errors.date = '日期格式应为 YYYY-MM-DD';
  } else {
    const parsedDate = parseDateOnly(rawDate);
    if (!parsedDate) {
      errors.date = '请填写真实存在的日期';
    } else {
      const offset = diffInCalendarDays(parsedDate, today);
      if (offset < 0) {
        errors.date = '期望日期不能早于今天';
      } else if (offset > BOOKING_WINDOW_DAYS) {
        errors.date = `最多只能预约 ${BOOKING_WINDOW_DAYS} 天以内的档期`;
      }
    }
  }

  if (!(TIME_SLOTS as readonly string[]).includes(input.timeSlot ?? '')) {
    errors.timeSlot = '请选择期望时段';
  }

  const note = (input.note ?? '').trim();
  if (note.length > MAX_NOTE_LENGTH) {
    errors.note = `备注请控制在 ${MAX_NOTE_LENGTH} 个字以内`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** 清理后的预约数据，可以直接交给接口去存库 */
export type BookingRequest = {
  ownerName: string;
  phone: string;
  petType: PetType;
  service: BookingService;
  date: string;
  timeSlot: TimeSlot;
  note: string;
  /** 参考报价，最终价格以到店确认为准 */
  estimate: PriceEstimate;
};

export type BuildBookingRequestOptions = {
  /** 测试时传入固定的“今天”，保证结果可复现 */
  today?: Date;
  /** 报价用的补充信息，不用填 service 和 petType，会自动从表单取 */
  pricing?: {
    weightKg?: number;
    mattedLevel?: MattedLevel;
    addOns?: readonly AddOnName[];
    membership?: MembershipTier;
  };
};

/**
 * 校验并整理预约数据。
 * 校验不通过就返回 ok: false 和错误提示；通过就返回清理好、带报价的数据。
 */
export function buildBookingRequest(
  input: BookingFormInput,
  options: BuildBookingRequestOptions = {},
): { ok: true; request: BookingRequest } | { ok: false; errors: BookingErrors } {
  const result = validateBooking(input, { today: options.today });
  if (!result.valid) {
    return { ok: false, errors: result.errors };
  }

  // 走到这里说明 petType / service / timeSlot 都已经通过校验
  const petType = input.petType as PetType;
  const service = input.service as BookingService;
  const timeSlot = input.timeSlot as TimeSlot;

  const estimate = estimatePrice({
    service,
    petType,
    weightKg: options.pricing?.weightKg,
    mattedLevel: options.pricing?.mattedLevel,
    addOns: options.pricing?.addOns,
    membership: options.pricing?.membership,
  });

  return {
    ok: true,
    request: {
      ownerName: input.ownerName.trim(),
      phone: normalizePhone(input.phone),
      petType,
      service,
      date: input.date.trim(),
      timeSlot,
      note: (input.note ?? '').trim(),
      estimate,
    },
  };
}
