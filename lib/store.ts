/**
 * 泡泡爪宠物洗护店 —— 门店基础信息
 *
 * 这些内容目前硬编码在 app/page.tsx 的 HTML 字符串里。
 * 单独抽一份出来，是为了让预约校验（营业时间、门店名）和后续后端接口
 * 有个统一来源，改地址、改营业时间时不用到处找。
 *
 * 注意：改动这里之后，app/page.tsx 和 index.html 里的文案也要一起改。
 */

export const STORE_INFO = {
  /** 门店名 */
  name: '泡泡爪宠物洗护店',
  /** 英文名，用于地图和标题 */
  nameEn: 'Pet Spa',
  /** 门店地址 */
  address: '上海市普陀区宜川路街道陕西北路 1620 号',
  /** 营业开始时间，HH:MM 格式 */
  openTime: '09:30',
  /** 营业结束时间，HH:MM 格式 */
  closeTime: '20:30',
  /** 门店热线，注意这是 400 热线，不作为客人的联系电话使用 */
  hotline: '400-882-1024',
  /** 微信号 */
  wechat: '泡泡爪 Pet Spa',
  /** 每周营业的星期，0 表示周日 */
  openWeekdays: [0, 1, 2, 3, 4, 5, 6] as const,
} as const;

/** 门店热线是否可以点成 tel: 链接（去掉横线后必须只剩数字） */
export function getHotlineHref(): string {
  const digits = STORE_INFO.hotline.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

/** 判断某天是否营业，传 0-6 表示周日到周六 */
export function isOpenOnWeekday(weekday: number): boolean {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw new Error(`星期必须是 0-6 的整数，收到：${weekday}`);
  }
  return (STORE_INFO.openWeekdays as readonly number[]).includes(weekday);
}
