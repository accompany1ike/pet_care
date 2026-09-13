/**
 * 测试辅助工具：把首页组件渲染成 HTML，再解析成可以查询的 DOM。
 *
 * 为什么要真的渲染一遍？
 * 因为 app/page.tsx 是把一大段 HTML 字符串用 dangerouslySetInnerHTML 塞进去的，
 * 直接对着源码文本做字符串匹配（tests/page-contract.test.ts 那样）只能证明
 * “字符串里有这段字”，证明不了“浏览器里真的会出现这个元素”。
 * 这里用 React 官方的服务端渲染函数跑一遍，拿到的就是真实输出，
 * 再用 node-html-parser 解析，就能像在浏览器里一样 querySelector 了。
 */

import { parse, type HTMLElement } from 'node-html-parser';
import { renderToStaticMarkup } from 'react-dom/server';

import Home from '../../app/page';

/** 渲染首页，返回真实的 HTML 字符串 */
export function renderPageHtml(): string {
  return renderToStaticMarkup(<Home />);
}

/** 渲染首页并解析成 DOM，方便用选择器查询 */
export function renderPage(): HTMLElement {
  return parse(renderPageHtml(), { comment: false });
}
