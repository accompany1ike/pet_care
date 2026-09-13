/**
 * 页面文案与逻辑代码的一致性测试
 *
 * 这个文件只干一件事：直接读 app/ 下的源码，检查“写在页面上的东西”和
 * “写在 lib/ 里的数据”对不对得上。
 *
 * 和另外两个测试的分工：
 * - page-render.test.ts 负责渲染后的真实 DOM（价格、选项、链接等）
 * - static-html-parity.test.ts 负责 index.html 和 app/page.tsx 两份页面是否一致
 * - 这个文件负责源码层面的检查，不需要渲染，跑得最快
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ADVERTISED_STARTING_PRICES } from '../lib/pricing';
import { STORE_INFO } from '../lib/store';

const appDir = fileURLToPath(new URL('../app', import.meta.url));

/** 把 app/ 下所有 .ts / .tsx 源码拼成一份，方便整体查找 */
function readAppSource(): string {
  const files = readdirSync(appDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));

  expect(files.length).toBeGreaterThan(0);
  return files.map((file) => readFileSync(file, 'utf8')).join('\n');
}

const appSource = readAppSource();
const pageSource = readFileSync(fileURLToPath(new URL('../app/page.tsx', import.meta.url)), 'utf8');
const bookingSource = readFileSync(
  fileURLToPath(new URL('../app/components/BookingSection.tsx', import.meta.url)),
  'utf8',
);

/** 从源码里抠出某个模板字符串的内容，例如 const pricingHtml = `...` */
function extractTemplateLiteral(source: string, name: string): string {
  const marker = `const ${name} = \``;
  const start = source.indexOf(marker);
  expect(start, `源码里找不到 ${marker}`).toBeGreaterThan(-1);
  const contentStart = start + marker.length;
  const end = source.indexOf('`', contentStart);
  expect(end).toBeGreaterThan(contentStart);
  return source.slice(contentStart, end);
}

/** 从价目区片段里取出「套餐名 -> 价格」 */
function parsePriceCards(source: string): Record<string, number> {
  const cards: Record<string, number> = {};
  const pattern = /<h3>([^<]+)<\/h3>\s*[\s\S]*?<b>(\d+)<\/b>/g;
  let match = pattern.exec(source);
  while (match !== null) {
    cards[match[1].trim()] = Number(match[2]);
    match = pattern.exec(source);
  }
  return cards;
}

describe('首页价目区和报价逻辑对得上', () => {
  // 价目区目前仍然是 HTML 字符串（page.tsx 里的 pricingHtml），单独抠出这一段来查，
  // 避免把服务卡片的 <h3> 也算进来。
  const priceCards = parsePriceCards(extractTemplateLiteral(pageSource, 'pricingHtml'));

  it('价目区正好有四个套餐', () => {
    expect(Object.keys(priceCards)).toHaveLength(4);
  });

  it('每个公开的“起”价都和 lib/pricing.ts 里的常数一致', () => {
    for (const [name, price] of Object.entries(ADVERTISED_STARTING_PRICES)) {
      expect(priceCards[name], `价目区缺少套餐「${name}」`).toBe(price);
    }
  });

  it('价目区没有多出代码里不知道的套餐', () => {
    expect(Object.keys(priceCards).sort()).toEqual(Object.keys(ADVERTISED_STARTING_PRICES).sort());
  });
});

describe('表单选项不会再和代码脱节', () => {
  // 预约表单已经改成 React 组件，三个下拉框的选项直接用常量渲染出来，
  // 所以“页面选项和代码不一致”这类问题从结构上就不可能再发生了。
  // 这里守住这个设计：选项必须来自常量，不能再手写一份 <option> 列表。
  it('宠物类型选项由 PET_TYPES 渲染', () => {
    expect(bookingSource).toContain('PET_TYPES.map');
  });

  it('预约服务选项由 BOOKING_SERVICES 渲染', () => {
    expect(bookingSource).toContain('BOOKING_SERVICES.map');
  });

  it('期望时段选项由 TIME_SLOTS 渲染', () => {
    expect(bookingSource).toContain('TIME_SLOTS.map');
  });

  it('没有手写的 <option> 文字（防止又抄一份出来）', () => {
    expect(bookingSource).not.toMatch(/<option>[^<{]/);
  });
});

describe('门店信息和页面文案对得上', () => {
  it('页面上能找到门店名', () => {
    expect(appSource).toContain(STORE_INFO.name);
  });

  it('页面上能找到完整地址', () => {
    expect(appSource).toContain(STORE_INFO.address);
  });

  it('页面上能找到营业时间', () => {
    expect(appSource).toContain(`${STORE_INFO.openTime} - ${STORE_INFO.closeTime}`);
  });

  it('页面上能找到热线和微信号', () => {
    expect(appSource).toContain(STORE_INFO.hotline);
    expect(appSource).toContain(STORE_INFO.wechat);
  });
});
