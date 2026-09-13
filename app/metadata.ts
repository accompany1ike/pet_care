import type { Metadata } from 'next';

import { STORE_INFO } from '../lib/store';

/**
 * 页面元信息（浏览器标签页标题、搜索结果摘要）。
 *
 * 之前这部分写死在 app/layout.tsx 里，中文变成了 '????????'，
 * 于是浏览器标签页和搜索结果里全是问号。
 *
 * 这里做了两件事让它不容易再坏：
 * 1. 单独放一个文件，不导入 CSS，可以直接写单元测试。
 * 2. 门店名、地址、营业时间都从 lib/store.ts 取，不重复抄一遍。
 */
export const metadata: Metadata = {
  title: `${STORE_INFO.name} | 预约制精品宠物洗护`,
  description: `${STORE_INFO.name}提供基础香波洗护、造型美容修剪与皮毛舒缓护理，猫狗分区、预约优先。门店地址：${STORE_INFO.address}，营业时间 ${STORE_INFO.openTime} - ${STORE_INFO.closeTime}。`,
};
