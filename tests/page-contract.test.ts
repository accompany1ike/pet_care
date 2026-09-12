/**
 * 页面文案与逻辑代码的一致性测试（契约测试）
 *
 * app/page.tsx 把整段 HTML 塞在一个字符串里，页面上的套餐名、价格、下拉框选项
 * 和 lib/ 里的逻辑是两份独立的数据。只要有人改了页面价格却忘了改代码，
 * 这里就会失败，起个“报警器”的作用。
 *
 * 这类测试只读文件、不起浏览器，跑起来很快。
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { BOOKING_SERVICES, PET_TYPES, ADVERTISED_STARTING_PRICES } from '../lib/pricing';
import { TIME_SLOTS } from '../lib/booking';
import { STORE_INFO } from '../lib/store';

const pageSource = readFileSync(fileURLToPath(new URL('../app/page.tsx', import.meta.url)), 'utf8');

/** 从首页价目区里把「套餐名 -> 价格」抠出来 */
function parsePriceCards(source: string): Record<string, number> {
  const start = source.indexOf('<section class="pricing"');
  const end = source.indexOf('<section class="booking"');
  expect(start, '找不到价目区 <section class="pricing">').toBeGreaterThan(-1);
  expect(end, '找不到预约区 <section class="booking">').toBeGreaterThan(start);

  const pricingSection = source.slice(start, end);
  const cards: Record<string, number> = {};
  const pattern = /<h3>([^<]+)<\/h3>\s*[\s\S]*?<b>(\d+)<\/b>/g;

  let match = pattern.exec(pricingSection);
  while (match !== null) {
    cards[match[1].trim()] = Number(match[2]);
    match = pattern.exec(pricingSection);
  }
  return cards;
}

describe('首页价目区和报价逻辑对得上', () => {
  const priceCards = parsePriceCards(pageSource);

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

describe('预约表单选项和校验规则对得上', () => {
  it('宠物类型选项一个都不少', () => {
    for (const petType of PET_TYPES) {
      expect(pageSource, `表单缺少宠物类型「${petType}」`).toContain(`<option>${petType}</option>`);
    }
  });

  it('预约服务选项一个都不少', () => {
    for (const service of BOOKING_SERVICES) {
      expect(pageSource, `表单缺少服务「${service}」`).toContain(`<option>${service}</option>`);
    }
  });

  it('期望时段选项和 TIME_SLOTS 完全一致', () => {
    for (const slot of TIME_SLOTS) {
      expect(pageSource, `表单缺少时段「${slot}」`).toContain(`<option>${slot}</option>`);
    }
  });
});

describe('门店信息和页面文案对得上', () => {
  it('页面上能找到门店名', () => {
    expect(pageSource).toContain(STORE_INFO.name);
  });

  it('页面上能找到完整地址', () => {
    expect(pageSource).toContain(STORE_INFO.address);
  });

  it('页面上能找到营业时间', () => {
    expect(pageSource).toContain(`${STORE_INFO.openTime} - ${STORE_INFO.closeTime}`);
  });

  it('页面上能找到热线和微信号', () => {
    expect(pageSource).toContain(STORE_INFO.hotline);
    expect(pageSource).toContain(STORE_INFO.wechat);
  });
});
