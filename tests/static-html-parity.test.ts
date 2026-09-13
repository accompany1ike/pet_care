/**
 * 静态版页面与 Next.js 页面的一致性测试
 *
 * 这个项目里有两份内容高度重复的页面：
 *   - index.html         根目录的静态版，图片用相对路径 assets/xxx.png
 *   - app/page.tsx       Next.js 版，图片用绝对路径 /assets/xxx.png
 *
 * AGENTS.md 里把“两份页面重复”列成了已知风险：改了一份忘了另一份，
 * 用户打开静态版就会看到旧价格、旧地址。这个文件专门盯住这种漂移。
 *
 * 这里只比较“本来就该完全一样”的东西：区块、价目、表单选项、门店信息。
 * 两份页面天生不同的地方（图片路径前缀）单独写明并检查，不当成错误。
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parse, type HTMLElement } from 'node-html-parser';
import { describe, expect, it } from 'vitest';

import { BOOKING_SERVICES, PET_TYPES, ADVERTISED_STARTING_PRICES } from '../lib/pricing';
import { TIME_SLOTS } from '../lib/booking';
import { STORE_INFO } from '../lib/store';
import { renderPage } from './helpers/render-page';

const staticRoot = parse(
  readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8'),
  { comment: false },
);
const nextRoot = renderPage();

/** 取某个页面里所有 section 的 id，排序后方便比较 */
function sectionIds(root: HTMLElement): string[] {
  return root
    .querySelectorAll('section')
    .map((section) => section.getAttribute('id') ?? '')
    .filter((id) => id.length > 0)
    .sort();
}

/** 取某个页面价目区的「套餐名 -> 价格」 */
function priceCards(root: HTMLElement): Record<string, string> {
  const result: Record<string, string> = {};
  for (const card of root.querySelectorAll('.price-card')) {
    const name = card.querySelector('h3')?.text.trim();
    const price = card.querySelector('.price b')?.text.trim();
    if (name && price) {
      result[name] = price;
    }
  }
  return result;
}

/** 取导航栏所有页内链接的目标，按出现顺序 */
function navTargets(root: HTMLElement): string[] {
  return root
    .querySelectorAll('.nav-links a')
    .map((link) => (link.getAttribute('href') ?? '').slice(1));
}

/** 取表单里第 n 个下拉框的选项文字 */
function selectOptions(root: HTMLElement, index: number): string[] {
  const select = root.querySelectorAll('form select')[index];
  if (!select) {
    return [];
  }
  return select.querySelectorAll('option').map((option) => option.text.trim());
}

describe('两份页面的区块结构一致', () => {
  it('有相同的 section id', () => {
    expect(sectionIds(staticRoot)).toEqual(sectionIds(nextRoot));
  });

  it('导航栏指向的区块顺序一致', () => {
    expect(navTargets(staticRoot)).toEqual(navTargets(nextRoot));
  });

  it('两份页面都包含预约表单', () => {
    expect(staticRoot.querySelector('form')).not.toBeNull();
    expect(nextRoot.querySelector('form')).not.toBeNull();
  });
});

describe('两份页面的价目一致', () => {
  it('套餐名和价格逐个相同', () => {
    expect(priceCards(staticRoot)).toEqual(priceCards(nextRoot));
  });

  it('也都和代码里的常量一致', () => {
    const expected: Record<string, string> = {};
    for (const [name, price] of Object.entries(ADVERTISED_STARTING_PRICES)) {
      expected[name] = String(price);
    }
    expect(priceCards(staticRoot)).toEqual(expected);
  });
});

describe('两份页面的表单选项一致', () => {
  it('宠物类型选项相同', () => {
    expect(selectOptions(staticRoot, 0)).toEqual(selectOptions(nextRoot, 0));
    expect(selectOptions(staticRoot, 0)).toEqual([...PET_TYPES]);
  });

  it('预约服务选项相同', () => {
    expect(selectOptions(staticRoot, 1)).toEqual(selectOptions(nextRoot, 1));
    expect(selectOptions(staticRoot, 1)).toEqual([...BOOKING_SERVICES]);
  });

  it('期望时段选项相同', () => {
    expect(selectOptions(staticRoot, 2)).toEqual(selectOptions(nextRoot, 2));
    expect(selectOptions(staticRoot, 2)).toEqual([...TIME_SLOTS]);
  });
});

describe('两份页面的门店信息一致', () => {
  it('地址、营业时间、热线、微信号都写全了', () => {
    const expectedTexts = [
      STORE_INFO.address,
      `${STORE_INFO.openTime} - ${STORE_INFO.closeTime}`,
      STORE_INFO.hotline,
      STORE_INFO.wechat,
    ];
    for (const text of expectedTexts) {
      expect(staticRoot.text, `index.html 里缺少「${text}」`).toContain(text);
      expect(nextRoot.text, `app/page.tsx 里缺少「${text}」`).toContain(text);
    }
  });
});

describe('两份页面天生的差异（不是错误，但要确实如此）', () => {
  it('静态版用相对路径，Next 版用绝对路径', () => {
    // 静态版是直接用浏览器打开 index.html 的，所以必须用 assets/ 相对路径；
    // Next 版由服务器提供，必须用 /assets/ 绝对路径。写反了其中一份就会裂图。
    for (const image of staticRoot.querySelectorAll('img')) {
      expect(image.getAttribute('src'), 'index.html 的图片应该用相对路径').toMatch(/^assets\/.+\.png$/);
    }
    for (const image of nextRoot.querySelectorAll('img')) {
      expect(image.getAttribute('src'), 'app/page.tsx 的图片应该用绝对路径').toMatch(/^\/assets\/.+\.png$/);
    }
  });

  it('两份页面的图片数量一致', () => {
    expect(staticRoot.querySelectorAll('img')).toHaveLength(nextRoot.querySelectorAll('img').length);
  });
});
