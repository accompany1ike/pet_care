import type { Metadata } from 'next';
import './globals.css';

// 元信息放在 app/metadata.ts 里，方便单独写测试。
export { metadata } from './metadata';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
