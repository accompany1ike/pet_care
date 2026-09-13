import { defineConfig } from 'vitest/config';

/**
 * 测试配置。
 *
 * 默认用 node 环境，跑纯函数测试最快。
 * 只有需要模拟点击、打字的组件测试（tests/booking-form.test.tsx）才用 jsdom，
 * 那个文件自己在第一行用 @vitest-environment jsdom 指定，不用改这里。
 *
 * 注意 include 要把 .tsx 也写进去，否则 xxx.test.tsx 这类文件会被静默跳过，
 * 看着“全部通过”其实根本没跑。
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
