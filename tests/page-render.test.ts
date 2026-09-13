/**
 * 首页渲染测试
 *
 * tests/page-contract.test.ts 是对着源码文本做字符串匹配，
 * 这个文件更进一步：把首页组件真的渲染一遍，再对渲染结果做结构检查。
 * 也就是说这里检查的是“浏览器里真的会出现什么”，而不是“源码里有没有这几个字”。
 *
 * 覆盖三件容易出事、又不容易被肉眼发现的事：
 * 1. 链接点了没反应（锚点写错）
 * 2. 表单和价目表和代码里的数据对不上
 * 3. 无障碍细节（图片没 alt、图标没标记成装饰、地图没说明）
 */

import { describe, expect, it } from 'vitest';

import { BOOKING_SERVICES, PET_TYPES, ADVERTISED_STARTING_PRICES } from '../lib/pricing';
import { TIME_SLOTS } from '../lib/booking';
import { STORE_INFO } from '../lib/store';
import { renderPage, renderPageHtml } from './helpers/render-page';

const html = renderPageHtml();
const root = renderPage();

describe('页面基本结构', () => {
  it('能渲染出内容', () => {
    expect(html.length).toBeGreaterThan(1000);
  });

  it('整页只有一个 h1，标题是店名', () => {
    const headings = root.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toContain(STORE_INFO.name);
  });

  it('有页头、主体和页脚', () => {
    expect(root.querySelector('header')).not.toBeNull();
    expect(root.querySelector('main')).not.toBeNull();
    expect(root.querySelector('footer')).not.toBeNull();
  });

  it('主体有 id="top"，让回到顶部的链接有地方可去', () => {
    expect(root.querySelector('main')?.getAttribute('id')).toBe('top');
  });

  it('每个 section 都有 id 或 aria-label，不会变成无法定位的区块', () => {
    const sections = root.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
    for (const section of sections) {
      const hasId = Boolean(section.getAttribute('id'));
      const hasLabel = Boolean(section.getAttribute('aria-label'));
      expect(hasId || hasLabel, `有个 section 既没有 id 也没有 aria-label：${section.outerHTML.slice(0, 80)}`).toBe(true);
    }
  });
});

describe('导航里的锚点都能跳到真实存在的区块', () => {
  it('所有页内链接的目标 id 都真的存在', () => {
    const links = root.querySelectorAll('a[href]').filter((link) => {
      const href = link.getAttribute('href') ?? '';
      return href.startsWith('#') && href.length > 1;
    });

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const targetId = (link.getAttribute('href') ?? '').slice(1);
      expect(
        root.querySelector(`#${targetId}`),
        `链接「${link.text.trim()}」指向 #${targetId}，但页面上没有这个 id`,
      ).not.toBeNull();
    }
  });

  it('导航栏五个入口都指向对应的区块', () => {
    const navLinks = root.querySelectorAll('.nav-links a');
    const targets = navLinks.map((link) => (link.getAttribute('href') ?? '').slice(1));
    expect(targets).toEqual(['services', 'interior', 'pricing', 'booking', 'store']);
  });

  it('预约相关的按钮都指向预约表单', () => {
    for (const selector of ['.nav-cta', '.hero-actions .primary-btn']) {
      expect(root.querySelector(selector)?.getAttribute('href'), `${selector} 没有指向 #booking`).toBe('#booking');
    }
  });

  it('“查看价目”按钮指向价目区', () => {
    expect(root.querySelector('.hero-actions .secondary-btn')?.getAttribute('href')).toBe('#pricing');
  });
});

describe('图片和装饰元素', () => {
  it('所有图片都有非空的 alt', () => {
    const images = root.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      const alt = image.getAttribute('alt');
      expect(alt, `图片 ${image.getAttribute('src')} 缺少 alt`).toBeTruthy();
      expect(alt?.trim().length).toBeGreaterThan(0);
    }
  });

  it('图片路径都用 /assets/ 开头（Next.js 的 public 目录约定）', () => {
    for (const image of root.querySelectorAll('img')) {
      const src = image.getAttribute('src');
      expect(src, `图片路径 ${src} 不符合 /assets/ 约定，网页上会显示成裂图`).toMatch(/^\/assets\/.+\.png$/);
    }
  });

  it('店内环境轮播有三张图和三个小圆点', () => {
    expect(root.querySelectorAll('.carousel .slide')).toHaveLength(3);
    expect(root.querySelectorAll('.carousel-dots span')).toHaveLength(3);
  });

  it('纯装饰的图标标了 aria-hidden，读屏软件会跳过', () => {
    for (const selector of ['.service-icon', '.store-info-icon']) {
      const icons = root.querySelectorAll(selector);
      expect(icons.length, `${selector} 一个都没找到`).toBeGreaterThan(0);
      for (const icon of icons) {
        expect(icon.getAttribute('aria-hidden'), `${selector} 里的图标没标 aria-hidden`).toBe('true');
      }
    }
  });

  it('三次轮播自动切换用的圆点也对读屏软件隐藏', () => {
    expect(root.querySelector('.carousel-dots')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('预约表单', () => {
  const form = root.querySelector('form');

  it('页面上有一个表单', () => {
    expect(form).not.toBeNull();
  });

  it('每个输入控件都被 label 包着，点文字也能聚焦到输入框', () => {
    const controls = root.querySelectorAll('form input, form select, form textarea');
    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) {
      const label = control.closest('label');
      expect(label, `${control.tagName} 没有被 label 包着`).not.toBeNull();
      expect(label?.text.trim().length, `${control.tagName} 的 label 没有文字`).toBeGreaterThan(0);
    }
  });

  it('表单字段数量和预约信息一一对应', () => {
    // 主人称呼、联系电话、宠物类型、预约服务、期望日期、期望时段、备注 = 7 个控件
    expect(root.querySelectorAll('form input, form select, form textarea')).toHaveLength(7);
  });

  it('宠物类型选项和代码里的常量完全一致', () => {
    const select = root.querySelectorAll('form select')[0];
    expect(select.querySelectorAll('option').map((option) => option.text.trim())).toEqual([...PET_TYPES]);
  });

  it('预约服务选项和代码里的常量完全一致', () => {
    const select = root.querySelectorAll('form select')[1];
    expect(select.querySelectorAll('option').map((option) => option.text.trim())).toEqual([
      ...BOOKING_SERVICES,
    ]);
  });

  it('期望时段选项和代码里的常量完全一致', () => {
    const select = root.querySelectorAll('form select')[2];
    expect(select.querySelectorAll('option').map((option) => option.text.trim())).toEqual([
      ...TIME_SLOTS,
    ]);
  });

  it('提交按钮是 type="submit"，交给表单自己的校验处理', () => {
    const button = root.querySelector('form button');
    expect(button?.getAttribute('type')).toBe('submit');
  });

  it('关掉了浏览器自带的校验，统一用我们自己的中文提示', () => {
    // 浏览器原生的提示是英文的、样式也改不了，所以用 noValidate 关掉
    expect(form?.outerHTML.toLowerCase()).toContain('novalidate');
  });

  it('刚打开页面时没有任何错误提示', () => {
    expect(root.querySelectorAll('.field-error')).toHaveLength(0);
    expect(root.querySelector('.form-success')).toBeNull();
  });

  it('页面上明确写了表单是演示、不会上传个人信息', () => {
    expect(form?.text).toContain('不会上传个人信息');
  });

  it('页面上说明了提交时会先在本地检查', () => {
    expect(form?.text).toContain('本地检查');
  });
});

describe('价目区', () => {
  const cards = root.querySelectorAll('.price-card');

  it('有四个套餐卡片', () => {
    expect(cards).toHaveLength(4);
  });

  it('每个卡片显示的价格都和代码里的常量一致', () => {
    const rendered = new Map<string, string>();
    for (const card of cards) {
      const name = card.querySelector('h3')?.text.trim() ?? '';
      const price = card.querySelector('.price b')?.text.trim() ?? '';
      rendered.set(name, price);
    }

    for (const [name, price] of Object.entries(ADVERTISED_STARTING_PRICES)) {
      expect(rendered.get(name), `价目区缺少套餐「${name}」`).toBe(String(price));
    }
  });

  it('每个卡片都标了“起”字，避免被当成最终价', () => {
    for (const card of cards) {
      expect(card.querySelector('.price')?.text).toContain('起');
    }
  });

  it('正好有一个卡片被标成热门推荐', () => {
    expect(cards.filter((card) => card.classList.contains('featured'))).toHaveLength(1);
  });
});

describe('门店信息', () => {
  it('地址、营业时间、热线、微信号都出现在页面上', () => {
    expect(root.text).toContain(STORE_INFO.address);
    expect(root.text).toContain(STORE_INFO.hotline);
    expect(root.text).toContain(STORE_INFO.wechat);
    expect(root.text).toContain(`${STORE_INFO.openTime} - ${STORE_INFO.closeTime}`);
  });

  it('示意地图标了是示意图，不会误导成真实比例', () => {
    expect(root.text).toContain('不代表真实比例');
  });

  it('内嵌地图用 role="img" 和 aria-labelledby 说明自己是什么', () => {
    const map = root.querySelector('svg.store-map');
    expect(map).not.toBeNull();
    expect(map?.getAttribute('role')).toBe('img');
    const labelledBy = map?.getAttribute('aria-labelledby');
    expect(labelledBy, '地图缺少 aria-labelledby').toBeTruthy();
    expect(root.querySelector(`#${labelledBy}`), 'aria-labelledby 指向的 id 不存在').not.toBeNull();
  });
});
