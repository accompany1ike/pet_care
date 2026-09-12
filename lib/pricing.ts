/**
 * 泡泡爪宠物洗护店 —— 套餐价格估算
 *
 * 这个文件把首页价目区“价格会根据体型、毛量、打结程度和宠物配合度微调”
 * 这句话翻译成可以计算的规则，方便预约时先给出一个参考总价。
 *
 * 设计原则：
 * 1. 函数都是纯函数，不碰 DOM、不发请求，所以可以直接写单元测试。
 * 2. 页面价目表上公开的“起”价必须和这里的基准价对得上，
 *    这项约束由 tests/pricing.test.ts 守住。
 */

/** 表单里的宠物类型，和 app/page.tsx 的下拉框选项保持一致 */
export const PET_TYPES = ['小型犬', '中大型犬', '猫咪', '其他宠物'] as const;
export type PetType = (typeof PET_TYPES)[number];

/** 表单里的预约服务，和 app/page.tsx 的下拉框选项保持一致 */
export const BOOKING_SERVICES = [
  '基础香波洗护',
  '造型美容修剪',
  '皮毛舒缓护理',
  '局部护理',
] as const;
export type BookingService = (typeof BOOKING_SERVICES)[number];

/** 毛发打结程度，到店后由护理师确认，预约时先由主人自评 */
export type MattedLevel = 'none' | 'light' | 'heavy';

/** 会员等级，用来算折扣 */
export type MembershipTier = 'none' | 'silver' | 'gold';

/**
 * 首页价目区公开的“起”价（单位：元）。
 * 这些数字来自 app/page.tsx 的价格卡片，改动页面价格时这里要一起改。
 */
export const ADVERTISED_STARTING_PRICES = {
  猫咪净洗: 128,
  小型犬精洗: 98,
  美容修剪: 168,
  局部护理: 29,
} as const;

/**
 * 各服务在不同宠物类型下的基准价（单位：元）。
 * 取的是“起步价”含义：体型越大、毛量越多，实际价格会往上加。
 */
const BASE_PRICES: Record<BookingService, Record<PetType, number>> = {
  基础香波洗护: { 小型犬: 98, 中大型犬: 158, 猫咪: 128, 其他宠物: 128 },
  造型美容修剪: { 小型犬: 168, 中大型犬: 248, 猫咪: 208, 其他宠物: 198 },
  皮毛舒缓护理: { 小型犬: 148, 中大型犬: 218, 猫咪: 168, 其他宠物: 158 },
  局部护理: { 小型犬: 29, 中大型犬: 39, 猫咪: 39, 其他宠物: 39 },
};

/** 体重加价档位：超过 maxKg 就按对应档位加价 */
const WEIGHT_SURCHARGE_TIERS: ReadonlyArray<{ maxKg: number; surcharge: number }> = [
  { maxKg: 10, surcharge: 0 },
  { maxKg: 20, surcharge: 20 },
  { maxKg: 40, surcharge: 50 },
  { maxKg: Number.POSITIVE_INFINITY, surcharge: 100 },
];

/** 打结加价：打结越多越费工，所以价格更高 */
const MATTED_SURCHARGE: Record<MattedLevel, number> = {
  none: 0,
  light: 30,
  heavy: 80,
};

/** 会员折扣比例：0.05 表示打 95 折 */
const MEMBERSHIP_DISCOUNT: Record<MembershipTier, number> = {
  none: 0,
  silver: 0.05,
  gold: 0.1,
};

/** 可单独加购的附加项目（单位：元） */
export const ADD_ONS = {
  剪指甲: 19,
  清耳: 19,
  挤肛门腺: 29,
  药浴护理: 60,
  牙齿清洁: 39,
} as const;
export type AddOnName = keyof typeof ADD_ONS;

export type PriceEstimateInput = {
  service: BookingService;
  petType: PetType;
  /** 宠物体重（公斤）。不填按 0 处理，代表没有体重加价 */
  weightKg?: number;
  mattedLevel?: MattedLevel;
  addOns?: readonly AddOnName[];
  membership?: MembershipTier;
};

export type PriceEstimate = {
  /** 基础洗护价 */
  basePrice: number;
  /** 体重加价 */
  weightSurcharge: number;
  /** 打结加价 */
  mattedSurcharge: number;
  /** 附加项目合计 */
  addOnsTotal: number;
  /** 附加项目明细，方便前台核对 */
  addOnLines: ReadonlyArray<{ name: AddOnName; price: number }>;
  /** 折扣前的合计 */
  subtotal: number;
  /** 折扣比例，0.05 表示 95 折 */
  discountRate: number;
  /** 实际优惠掉的钱 */
  discountAmount: number;
  /** 最终参考总价 */
  total: number;
};

/** 判断一个字符串是不是合法的宠物类型 */
export const isPetType = (value: string): value is PetType =>
  (PET_TYPES as readonly string[]).includes(value);

/** 判断一个字符串是不是合法的预约服务 */
export const isBookingService = (value: string): value is BookingService =>
  (BOOKING_SERVICES as readonly string[]).includes(value);

const isAddOnName = (value: string): value is AddOnName =>
  Object.prototype.hasOwnProperty.call(ADD_ONS, value);

/**
 * 取某个服务 + 宠物类型的基础价。
 * 传入不认识的值会直接报错，避免页面传入脏数据后算出一个凭空的数字。
 */
export function getBasePrice(service: string, petType: string): number {
  if (!isBookingService(service)) {
    throw new Error(`未知的预约服务：${service}`);
  }
  if (!isPetType(petType)) {
    throw new Error(`未知的宠物类型：${petType}`);
  }
  return BASE_PRICES[service][petType];
}

/** 按体重取加价金额 */
export function getWeightSurcharge(weightKg: number | undefined): number {
  if (weightKg === undefined) {
    return 0;
  }
  if (!Number.isFinite(weightKg) || weightKg < 0) {
    throw new Error(`体重必须是非负数字，收到：${weightKg}`);
  }
  const tier = WEIGHT_SURCHARGE_TIERS.find((item) => weightKg <= item.maxKg);
  return tier ? tier.surcharge : 0;
}

/** 按打结程度取加价金额 */
export function getMattedSurcharge(mattedLevel: MattedLevel | undefined): number {
  if (mattedLevel === undefined) {
    return 0;
  }
  const surcharge = MATTED_SURCHARGE[mattedLevel];
  if (surcharge === undefined) {
    throw new Error(`未知的打结程度：${mattedLevel}`);
  }
  return surcharge;
}

/** 把附加项目名字列表换算成明细和合计 */
export function sumAddOns(addOns: readonly string[] | undefined): {
  lines: Array<{ name: AddOnName; price: number }>;
  total: number;
} {
  if (!addOns || addOns.length === 0) {
    return { lines: [], total: 0 };
  }
  const lines: Array<{ name: AddOnName; price: number }> = [];
  for (const name of addOns) {
    if (!isAddOnName(name)) {
      throw new Error(`未知的附加项目：${name}`);
    }
    lines.push({ name, price: ADD_ONS[name] });
  }
  return { lines, total: lines.reduce((sum, line) => sum + line.price, 0) };
}

/** 取会员折扣比例 */
export function getDiscountRate(membership: MembershipTier | undefined): number {
  if (membership === undefined) {
    return 0;
  }
  const rate = MEMBERSHIP_DISCOUNT[membership];
  if (rate === undefined) {
    throw new Error(`未知的会员等级：${membership}`);
  }
  return rate;
}

/**
 * 估算参考总价。
 *
 * 计算顺序：基础价 + 体重加价 + 打结加价 + 附加项目 = 小计，
 * 再用会员折扣算优惠金额，最后四舍五入成整数元。
 */
export function estimatePrice(input: PriceEstimateInput): PriceEstimate {
  const basePrice = getBasePrice(input.service, input.petType);
  const weightSurcharge = getWeightSurcharge(input.weightKg);
  const mattedSurcharge = getMattedSurcharge(input.mattedLevel);
  const { lines: addOnLines, total: addOnsTotal } = sumAddOns(input.addOns);

  const subtotal = basePrice + weightSurcharge + mattedSurcharge + addOnsTotal;
  const discountRate = getDiscountRate(input.membership);
  const discountAmount = Math.round(subtotal * discountRate);

  return {
    basePrice,
    weightSurcharge,
    mattedSurcharge,
    addOnsTotal,
    addOnLines,
    subtotal,
    discountRate,
    discountAmount,
    total: subtotal - discountAmount,
  };
}

/** 把金额格式化成页面上的写法，例如 128 -> “¥128” */
export function formatPrice(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new Error(`金额必须是数字，收到：${amount}`);
  }
  return `¥${Math.round(amount)}`;
}

/** 把金额格式化成“起”价写法，例如 128 -> “¥128 起” */
export function formatStartingPrice(amount: number): string {
  return `${formatPrice(amount)} 起`;
}
