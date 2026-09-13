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

还有几个专门盯住“页面和代码不同步”的测试文件：

- `tests/page-contract.test.ts`：直接读 `app/` 下的源码，核对价目、门店信息是否和代码一致，
  并确认表单选项是用常量渲染出来的（而不是又手抄一份）。
- `tests/page-render.test.ts`：把首页组件真的渲染一遍，检查浏览器里实际出现的元素。
  覆盖链接锚点是否都能跳到真实区块、图片有没有 alt、装饰图标有没有标 `aria-hidden`、
  表单控件有没有被 label 包住、内嵌地图有没有可读说明。
- `tests/static-html-parity.test.ts`：核对根目录静态版 `index.html` 和 Next.js 版 `app/page.tsx`
  是否写着同一份价目、同一份表单选项、同一份门店信息。两份页面重复是本项目的已知风险，
  这个文件专门防止“改了一份忘了另一份”。
- `tests/booking-form.test.tsx`：唯一一个模拟真人操作的测试（用 jsdom）。
  往输入框里打字、选下拉框、点提交，检查错误提示和参考价是否正确。
  这是唯一能证明“表单真的会校验”的测试。
- `tests/metadata.test.ts`：检查浏览器标签页标题和搜索结果摘要不为空、没有问号乱码。

## 预约表单的行为

预约表单（`app/components/BookingSection.tsx`）在浏览器本地做校验和报价：

- 点提交会检查主人称呼、手机号、日期是否合法/是否过期/是否超出 60 天窗口、备注长度。
- 校验通过后显示一个参考价，价格由 `lib/pricing.ts` 算出。
- **目前没有接入后端**，数据不会上传到任何地方，页面上也照实写明了这一点。
  将来要接后端，改 `handleSubmit` 里的提交部分即可，校验规则可以直接复用 `lib/booking.ts`，
  这样前端和后端的判断标准不会跑偏。

## 目录说明

- `app/`：Next.js App Router 页面。
  - `page.tsx`：首页。纯展示的区块仍是 HTML 字符串（按区块拆开），需要交互的预约区用组件。
  - `components/BookingSection.tsx`：预约区，客户端组件，负责表单校验和报价。
  - `metadata.ts`：标签页标题和描述，门店信息取自 `lib/store.ts`。
  - `layout.tsx`：全局页面壳。
  - `globals.css`：全站样式。
- `lib/`：和界面无关的纯逻辑，方便写测试。目前有报价、预约校验和门店信息。
- `tests/`：Vitest 测试文件；`tests/helpers/` 放测试用的小工具。
- `public/assets/`：Next.js 页面用到的图片；根目录 `assets/` 是静态版 `index.html` 用的图片。

