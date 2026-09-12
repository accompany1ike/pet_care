import { describe, expect, it } from 'vitest';

import {
  ADD_ONS,
  ADVERTISED_STARTING_PRICES,
  BOOKING_SERVICES,
  PET_TYPES,
  estimatePrice,
  formatPrice,
  formatStartingPrice,
  getBasePrice,
  getDiscountRate,
  getMattedSurcharge,
  getWeightSurcharge,
  isBookingService,
  isPetType,
  sumAddOns,
  type MattedLevel,
  type MembershipTier,
} from '../lib/pricing';

describe('宠物类型和服务选项', () => {
  it('和预约表单的下拉框选项保持一致', () => {
    expect(PET_TYPES).toEqual(['小型犬', '中大型犬', '猫咪', '其他宠物']);
    expect(BOOKING_SERVICES).toEqual([
      '基础香波洗护',
      '造型美容修剪',
      '皮毛舒缓护理',
      '局部护理',
    ]);
  });

  it('能正确识别合法与非法取值', () => {
    expect(isPetType('小型犬')).toBe(true);
    expect(isPetType('兔子')).toBe(false);
    expect(isBookingService('局部护理')).toBe(true);
    expect(isBookingService('洗澡')).toBe(false);
  });
});

describe('基础价 getBasePrice', () => {
  it('每种服务都给所有宠物类型定了价', () => {
    for (const service of BOOKING_SERVICES) {
      for (const petType of PET_TYPES) {
        expect(getBasePrice(service, petType)).toBeGreaterThan(0);
      }
    }
  });

  it('和首页价目表上公开的“起”价对得上', () => {
    // 小型犬精洗 ¥98 起
    expect(getBasePrice('基础香波洗护', '小型犬')).toBe(ADVERTISED_STARTING_PRICES.小型犬精洗);
    // 猫咪净洗 ¥128 起
    expect(getBasePrice('基础香波洗护', '猫咪')).toBe(ADVERTISED_STARTING_PRICES.猫咪净洗);
  });

  it('每个服务最低那一档等于价目表上的“起”价', () => {
    const lowestOf = (service: (typeof BOOKING_SERVICES)[number]) =>
      Math.min(...PET_TYPES.map((petType) => getBasePrice(service, petType)));

    expect(lowestOf('造型美容修剪')).toBe(ADVERTISED_STARTING_PRICES.美容修剪);
    expect(lowestOf('局部护理')).toBe(ADVERTISED_STARTING_PRICES.局部护理);
    expect(lowestOf('基础香波洗护')).toBe(ADVERTISED_STARTING_PRICES.小型犬精洗);
  });

  it('中大型犬比小型犬贵，符合“按体型微调”的说明', () => {
    for (const service of BOOKING_SERVICES) {
      const small = getBasePrice(service, '小型犬');
      const large = getBasePrice(service, '中大型犬');
      expect(large).toBeGreaterThan(small);
    }
  });

  it('遇到不认识的服务或宠物类型会直接报错，而不是默默返回 0', () => {
    expect(() => getBasePrice('皇家SPA', '猫咪')).toThrow('未知的预约服务');
    expect(() => getBasePrice('基础香波洗护', '蜥蜴')).toThrow('未知的宠物类型');
  });
});

describe('体重加价 getWeightSurcharge', () => {
  it('不填体重或者 10 公斤以内都不加价', () => {
    expect(getWeightSurcharge(undefined)).toBe(0);
    expect(getWeightSurcharge(0)).toBe(0);
    expect(getWeightSurcharge(5)).toBe(0);
    expect(getWeightSurcharge(10)).toBe(0);
  });

  it('按档位加价，边界值取的是上一档', () => {
    expect(getWeightSurcharge(10.1)).toBe(20);
    expect(getWeightSurcharge(20)).toBe(20);
    expect(getWeightSurcharge(20.5)).toBe(50);
    expect(getWeightSurcharge(40)).toBe(50);
    expect(getWeightSurcharge(40.1)).toBe(100);
    expect(getWeightSurcharge(80)).toBe(100);
  });

  it('体重不合法时报错', () => {
    expect(() => getWeightSurcharge(-1)).toThrow('体重必须是非负数字');
    expect(() => getWeightSurcharge(Number.NaN)).toThrow('体重必须是非负数字');
    expect(() => getWeightSurcharge(Number.POSITIVE_INFINITY)).toThrow('体重必须是非负数字');
  });
});

describe('打结加价 getMattedSurcharge', () => {
  it('按打结程度加价', () => {
    expect(getMattedSurcharge(undefined)).toBe(0);
    expect(getMattedSurcharge('none')).toBe(0);
    expect(getMattedSurcharge('light')).toBe(30);
    expect(getMattedSurcharge('heavy')).toBe(80);
  });

  it('打结越严重加价越高', () => {
    expect(getMattedSurcharge('heavy')).toBeGreaterThan(getMattedSurcharge('light'));
  });

  it('不认识的打结程度会报错', () => {
    expect(() => getMattedSurcharge('超级打结' as MattedLevel)).toThrow('未知的打结程度');
  });
});

describe('附加项目 sumAddOns', () => {
  it('不选附加项目就是 0', () => {
    expect(sumAddOns(undefined)).toEqual({ lines: [], total: 0 });
    expect(sumAddOns([])).toEqual({ lines: [], total: 0 });
  });

  it('把选中的项目换算成明细和合计', () => {
    const result = sumAddOns(['剪指甲', '清耳']);
    expect(result.lines).toEqual([
      { name: '剪指甲', price: 19 },
      { name: '清耳', price: 19 },
    ]);
    expect(result.total).toBe(38);
  });

  it('多个项目按单价累加', () => {
    expect(sumAddOns(['药浴护理', '挤肛门腺']).total).toBe(
      ADD_ONS.药浴护理 + ADD_ONS.挤肛门腺,
    );
  });

  it('不认识的项目会报错', () => {
    expect(() => sumAddOns(['剪指甲', '喷香水'])).toThrow('未知的附加项目');
  });
});

describe('会员折扣 getDiscountRate', () => {
  it('不同等级折扣不同', () => {
    expect(getDiscountRate(undefined)).toBe(0);
    expect(getDiscountRate('none')).toBe(0);
    expect(getDiscountRate('silver')).toBe(0.05);
    expect(getDiscountRate('gold')).toBe(0.1);
  });

  it('金卡比银卡优惠更多', () => {
    expect(getDiscountRate('gold')).toBeGreaterThan(getDiscountRate('silver'));
  });

  it('不认识的等级会报错', () => {
    expect(() => getDiscountRate('钻石卡' as MembershipTier)).toThrow('未知的会员等级');
  });
});

describe('报价 estimatePrice', () => {
  it('只选服务和宠物类型时，总价就是基础价', () => {
    const estimate = estimatePrice({ service: '基础香波洗护', petType: '小型犬' });
    expect(estimate.basePrice).toBe(98);
    expect(estimate.subtotal).toBe(98);
    expect(estimate.discountAmount).toBe(0);
    expect(estimate.total).toBe(98);
  });

  it('各项加价和折扣都算进去', () => {
    // 98 基础 + 20 体重 + 30 轻度打结 + 19 剪指甲 = 167
    // 金卡 9 折：167 * 0.1 = 16.7，四舍五入 17，最终 150
    const estimate = estimatePrice({
      service: '基础香波洗护',
      petType: '小型犬',
      weightKg: 12,
      mattedLevel: 'light',
      addOns: ['剪指甲'],
      membership: 'gold',
    });

    expect(estimate.basePrice).toBe(98);
    expect(estimate.weightSurcharge).toBe(20);
    expect(estimate.mattedSurcharge).toBe(30);
    expect(estimate.addOnsTotal).toBe(19);
    expect(estimate.subtotal).toBe(167);
    expect(estimate.discountRate).toBe(0.1);
    expect(estimate.discountAmount).toBe(17);
    expect(estimate.total).toBe(150);
  });

  it('优惠金额四舍五入到整数元', () => {
    // 局部护理小型犬 29 元，银卡 95 折：29 * 0.05 = 1.45，四舍五入 1
    const estimate = estimatePrice({
      service: '局部护理',
      petType: '小型犬',
      membership: 'silver',
    });
    expect(estimate.subtotal).toBe(29);
    expect(estimate.discountAmount).toBe(1);
    expect(estimate.total).toBe(28);
  });

  it('拿到的总价永远是整数，方便直接显示', () => {
    const estimate = estimatePrice({
      service: '造型美容修剪',
      petType: '中大型犬',
      weightKg: 33.3,
      mattedLevel: 'heavy',
      addOns: ['药浴护理', '牙齿清洁'],
      membership: 'silver',
    });
    expect(Number.isInteger(estimate.total)).toBe(true);
    expect(Number.isInteger(estimate.discountAmount)).toBe(true);
  });

  it('折扣价一定不高于原价', () => {
    for (const membership of ['none', 'silver', 'gold'] as const) {
      const estimate = estimatePrice({
        service: '皮毛舒缓护理',
        petType: '猫咪',
        membership,
      });
      expect(estimate.total).toBeLessThanOrEqual(estimate.subtotal);
    }
  });

  it('明细项相加必须等于小计，避免报价对不上', () => {
    const estimate = estimatePrice({
      service: '造型美容修剪',
      petType: '中大型犬',
      weightKg: 25,
      mattedLevel: 'light',
      addOns: ['挤肛门腺'],
    });
    expect(estimate.basePrice + estimate.weightSurcharge + estimate.mattedSurcharge + estimate.addOnsTotal).toBe(
      estimate.subtotal,
    );
    expect(estimate.subtotal - estimate.discountAmount).toBe(estimate.total);
  });

  it('附加项目明细保留单价，方便前台逐条核对', () => {
    const estimate = estimatePrice({
      service: '局部护理',
      petType: '猫咪',
      addOns: ['清耳', '挤肛门腺'],
    });
    expect(estimate.addOnLines).toEqual([
      { name: '清耳', price: 19 },
      { name: '挤肛门腺', price: 29 },
    ]);
    expect(estimate.addOnsTotal).toBe(48);
  });
});

describe('金额格式化', () => {
  it('按页面习惯显示成 ¥128', () => {
    expect(formatPrice(128)).toBe('¥128');
    expect(formatPrice(0)).toBe('¥0');
  });

  it('小数会四舍五入到整数', () => {
    expect(formatPrice(128.4)).toBe('¥128');
    expect(formatPrice(128.5)).toBe('¥129');
  });

  it('“起”价写法多了两个字', () => {
    expect(formatStartingPrice(98)).toBe('¥98 起');
  });

  it('不是数字就报错', () => {
    expect(() => formatPrice(Number.NaN)).toThrow('金额必须是数字');
    expect(() => formatPrice(Number.POSITIVE_INFINITY)).toThrow('金额必须是数字');
  });
});
