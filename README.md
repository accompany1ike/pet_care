<!-- translithub:lang-nav-start -->
**Read in other languages / 其他语言:** [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md)
<!-- translithub:lang-nav-end -->

# 泡泡爪宠物洗护店

这是一个使用 Next.js App Router 构建的宠物洗护店单页网站。

## 本地运行

```powershell
npm install
npm run dev
```

打开 `http://localhost:3000` 查看页面。

## 构建

```powershell
npm run build
```

## 测试

项目使用 [Vitest](https://vitest.dev/) 做单元测试，测试代码都在 `tests/` 目录里。

```powershell
npm test          # 跑一遍全部测试
npm run test:watch  # 开发时用，改完代码自动重跑
```

测试覆盖三类内容：

- `lib/pricing.ts`：套餐报价计算，包含基础价、体重加价、打结加价、附加项目和会员折扣。
  测试会守住首页价目表公开的“起”价（小型犬精洗 98、猫咪净洗 128、美容修剪 168、局部护理 29）。
- `lib/booking.ts`：预约表单校验，包含手机号格式、日期是否合法/是否过期/是否超出预约窗口、
  时段是否在营业时间内、以及必填项和超长文本。
- `lib/store.ts`：门店信息，包含营业时间和热线链接。

还有三个专门盯住“页面和代码不同步”的测试文件：

- `tests/page-contract.test.ts`：直接读 `app/page.tsx` 源码，核对价目、表单选项、门店信息是否和代码一致。
- `tests/page-render.test.ts`：把首页组件真的渲染一遍，检查浏览器里实际出现的元素。
  覆盖链接锚点是否都能跳到真实区块、图片有没有 alt、装饰图标有没有标 `aria-hidden`、
  表单控件有没有被 label 包住、内嵌地图有没有可读说明。
- `tests/static-html-parity.test.ts`：核对根目录静态版 `index.html` 和 Next.js 版 `app/page.tsx`
  是否写着同一份价目、同一份表单选项、同一份门店信息。两份页面重复是本项目的已知风险，
  这个文件专门防止“改了一份忘了另一份”。

## 目录说明

- `app/`：Next.js App Router 页面（`page.tsx`、`layout.tsx`、`globals.css`）。
- `lib/`：和界面无关的纯逻辑，方便写测试。目前有报价、预约校验和门店信息。
- `tests/`：Vitest 测试文件。
- `public/assets/`：Next.js 页面用到的图片；根目录 `assets/` 是静态版 `index.html` 用的图片。

