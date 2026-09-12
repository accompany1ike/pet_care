import { defineConfig } from 'vitest/config';

/**
 * 测试配置。
 *
 * 目前测的都是纯函数（报价计算、表单校验、页面文案一致性），
 * 不需要浏览器环境，所以用 node 就够了，跑起来更快。
 * 以后如果要测 React 组件，再把 environment 换成 jsdom 并补上
 * @testing-library/react。
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
