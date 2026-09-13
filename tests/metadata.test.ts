/**
 * 页面元信息测试（浏览器标签页标题、搜索结果摘要）
 *
 * 原来 app/layout.tsx 里这部分中文全变成了 '????????'，
 * 结果浏览器标签页和搜索结果里都是问号。修复之后加这个测试守住，
 * 免得哪天编码问题又把标题弄坏。
 *
 * app/metadata.ts 不导入 CSS，所以可以直接 import 进来拿到真实对象，
 * 比对着源码做字符串匹配可靠得多。
 */

import { describe, expect, it } from 'vitest';

import { metadata } from '../app/metadata';
import { STORE_INFO } from '../lib/store';

const title = String(metadata.title);
const description = String(metadata.description);

describe('页面标题和描述', () => {
  it('标题里有门店名', () => {
    expect(title).toContain(STORE_INFO.name);
  });

  it('描述里有门店名、地址和营业时间', () => {
    expect(description).toContain(STORE_INFO.name);
    expect(description).toContain(STORE_INFO.address);
    expect(description).toContain(STORE_INFO.openTime);
  });

  it('标题和描述里没有问号乱码', () => {
    expect(title, '标题里出现了问号，可能是编码又坏了').not.toContain('?');
    expect(description, '描述里出现了问号，可能是编码又坏了').not.toContain('?');
  });

  it('标题里没有连续问号这种典型乱码痕迹', () => {
    expect(title).not.toMatch(/\?{2,}/);
    expect(description).not.toMatch(/\?{2,}/);
  });

  it('标题长度适中，搜索结果里不会被截断太多', () => {
    // 中文标题一般控制在 30 个字符以内比较稳妥
    expect(title.length).toBeLessThanOrEqual(30);
    expect(title.length).toBeGreaterThan(5);
  });

  it('描述长度在常见建议范围内', () => {
    expect(description.length).toBeGreaterThanOrEqual(40);
    expect(description.length).toBeLessThanOrEqual(160);
  });
});
