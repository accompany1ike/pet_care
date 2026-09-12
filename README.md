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

测试覆盖两类内容：

- `lib/pricing.ts`：套餐报价计算，包含基础价、体重加价、打结加价、附加项目和会员折扣。
  测试会守住首页价目表公开的“起”价（小型犬精洗 98、猫咪净洗 128、美容修剪 168、局部护理 29）。
- `lib/booking.ts`：预约表单校验，包含手机号格式、日期是否合法/是否过期/是否超出预约窗口、
  时段是否在营业时间内、以及必填项和超长文本。
- `lib/store.ts`：门店信息，包含营业时间和热线链接。
- `tests/page-contract.test.ts`：契约测试。直接读取 `app/page.tsx`，逐个核对页面上的套餐价格、
  宠物类型、预约服务、时段和门店信息，是否和 `lib/` 里的代码一致。
  改页面价格却忘记改代码时，这个测试会立刻失败。

## 目录说明

- `app/`：Next.js App Router 页面（`page.tsx`、`layout.tsx`、`globals.css`）。
- `lib/`：和界面无关的纯逻辑，方便写测试。目前有报价、预约校验和门店信息。
- `tests/`：Vitest 测试文件。
- `public/assets/`：Next.js 页面用到的图片；根目录 `assets/` 是静态版 `index.html` 用的图片。

