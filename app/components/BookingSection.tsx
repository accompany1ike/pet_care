'use client';

/**
 * 预约区（含可校验的预约表单）
 *
 * 原来这一整段是塞在 app/page.tsx 的 HTML 字符串里的，点了提交什么都不会发生。
 * 现在改成真正的 React 组件：
 * - 填的内容存在 state 里
 * - 点提交时用 lib/booking.ts 的校验规则检查（就是单元测试覆盖的那套规则）
 * - 校验通过后用 lib/pricing.ts 算出参考价并显示出来
 *
 * 注意：目前只在浏览器本地校验，没有接入后端，也不会把数据发给任何人。
 * 页面上也照实写明了这一点。将来接后端时，把 handleSubmit 里改成发请求即可，
 * 校验规则可以直接复用 lib/booking.ts，前后端保持一致。
 */

import { useEffect, useRef, useState } from 'react';

import { BOOKING_SERVICES, PET_TYPES, formatPrice, type PriceEstimate } from '../../lib/pricing';
import {
  BOOKING_WINDOW_DAYS,
  TIME_SLOTS,
  addDays,
  buildBookingRequest,
  toDateKey,
  type BookingErrors,
  type BookingFormInput,
} from '../../lib/booking';

/** 表单初始值：下拉框默认选第一项，和原来静态页面的效果一致 */
const EMPTY_FORM: BookingFormInput = {
  ownerName: '',
  phone: '',
  petType: PET_TYPES[0],
  service: BOOKING_SERVICES[0],
  date: '',
  timeSlot: TIME_SLOTS[0],
  note: '',
};

/** 表单字段在页面上的先后顺序，用来确定“第一个填错的字段”是哪一个 */
const FIELD_ORDER: ReadonlyArray<keyof BookingFormInput> = [
  'ownerName',
  'phone',
  'petType',
  'service',
  'date',
  'timeSlot',
  'note',
];

type Confirmed = {
  /** 例如“小型犬 · 基础香波洗护” */
  summary: string;
  date: string;
  timeSlot: string;
  estimate: PriceEstimate;
};

export default function BookingSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<BookingFormInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  /**
   * 日期框的可选范围：最早今天，最晚 60 天后。
   *
   * 故意留到挂载之后才算。页面是静态预渲染的，如果渲染时就把日期写死，
   * 服务器构建那天的日期会和用户打开页面那天不一样，React 会报 hydration 不一致。
   * 挂载后再设置就避开了这个问题；在算出来之前不加限制也没关系，
   * 反正提交时 lib/booking.ts 还会再校验一遍日期。
   */
  const [dateRange, setDateRange] = useState<{ min?: string; max?: string }>({});

  useEffect(() => {
    const today = new Date();
    setDateRange({
      min: toDateKey(today),
      max: toDateKey(addDays(today, BOOKING_WINDOW_DAYS)),
    });
  }, []);

  /** 改哪个字段就更新哪个字段，同时把该字段的旧错误提示消掉 */
  function updateField(field: keyof BookingFormInput, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setConfirmed(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = buildBookingRequest(form);
    if (!result.ok) {
      setErrors(result.errors);
      setConfirmed(null);
      focusFirstInvalidField(result.errors);
      return;
    }

    const { request } = result;
    setErrors({});
    setConfirmed({
      summary: `${request.petType} · ${request.service}`,
      date: request.date,
      timeSlot: request.timeSlot,
      estimate: request.estimate,
    });
  }

  /**
   * 提交失败时，把光标挪到第一个填错的输入框。
   *
   * 用键盘填表的人、以及读屏软件用户，不用自己从头找一遍哪一格红了。
   * 只在“点提交”这一刻挪焦点，平时边打字边消除错误提示不会动焦点，
   * 否则会把人正在打字的光标抢走。
   */
  function focusFirstInvalidField(nextErrors: BookingErrors) {
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (!firstInvalid) {
      return;
    }
    formRef.current?.querySelector<HTMLElement>(`#booking-${firstInvalid}`)?.focus();
  }

  /** 某个字段填错时，在输入框下面补一行红字 */
  function renderFieldError(field: keyof BookingFormInput) {
    const message = errors[field];
    if (!message) {
      return null;
    }
    return (
      <span className="field-error" id={`booking-${field}-error`}>
        {message}
      </span>
    );
  }

  /** 填错的字段用 aria-describedby 指向那行红字，读屏软件会一起念出来 */
  function errorIdFor(field: keyof BookingFormInput) {
    return errors[field] ? `booking-${field}-error` : undefined;
  }

  const errorCount = Object.keys(errors).length;

  return (
    <section className="booking" id="booking">
      <div className="wrap booking-layout">
        <div className="booking-copy">
          <h2>提前预约，减少等待和应激</h2>
          <p>
            预约后我们会预留洗护位和护理师，并根据宠物情况准备合适的用品。填好右边表单点提交，会立刻检查手机号、日期和时段，并给出参考价。
          </p>
          <div className="process">
            <div className="step">
              <div className="step-number">01</div>
              <div>
                <strong>提交宠物信息</strong>
                <span>填写品种、体重、服务类型和希望到店时间。</span>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div>
                <strong>门店确认档期</strong>
                <span>工作人员确认价格、时长和注意事项。</span>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div>
                <strong>到店安心洗护</strong>
                <span>护理完成后反馈皮肤、耳朵、指甲和毛发状态。</span>
              </div>
            </div>
          </div>
        </div>
        <div className="booking-panel" aria-label="预约表单">
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <label>
              主人称呼（必填）
              <input
                id="booking-ownerName"
                type="text"
                required
                placeholder="例如：陈女士"
                autoComplete="name"
                value={form.ownerName}
                onChange={(event) => updateField('ownerName', event.target.value)}
                aria-invalid={errors.ownerName ? true : undefined}
                aria-describedby={errorIdFor('ownerName')}
              />
              {renderFieldError('ownerName')}
            </label>
            <label>
              联系电话（必填）
              <input
                id="booking-phone"
                type="tel"
                required
                placeholder="请输入手机号"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errorIdFor('phone')}
              />
              {renderFieldError('phone')}
            </label>
            <label>
              宠物类型
              <select
                id="booking-petType"
                value={form.petType}
                onChange={(event) => updateField('petType', event.target.value)}
              >
                {PET_TYPES.map((petType) => (
                  <option key={petType} value={petType}>
                    {petType}
                  </option>
                ))}
              </select>
              {renderFieldError('petType')}
            </label>
            <label>
              预约服务
              <select
                id="booking-service"
                value={form.service}
                onChange={(event) => updateField('service', event.target.value)}
              >
                {BOOKING_SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {renderFieldError('service')}
            </label>
            <label>
              期望日期（必填）
              <input
                id="booking-date"
                type="date"
                required
                min={dateRange.min}
                max={dateRange.max}
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                aria-invalid={errors.date ? true : undefined}
                aria-describedby={errorIdFor('date')}
              />
              {renderFieldError('date')}
            </label>
            <label>
              期望时段
              <select
                id="booking-timeSlot"
                value={form.timeSlot}
                onChange={(event) => updateField('timeSlot', event.target.value)}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {renderFieldError('timeSlot')}
            </label>
            <label className="full">
              备注（选填）
              <textarea
                id="booking-note"
                placeholder="可填写宠物体重、是否怕吹风、皮肤情况等"
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                aria-invalid={errors.note ? true : undefined}
                aria-describedby={errorIdFor('note')}
              />
              {renderFieldError('note')}
            </label>

            {errorCount > 0 ? (
              <p className="field-error full" role="alert">
                还有 {errorCount} 处需要修改，改好后再提交一次。
              </p>
            ) : null}

            {confirmed ? (
              <p className="form-success full" role="status">
                已记录您的预约意向：{confirmed.summary}，{confirmed.date}{' '}
                {confirmed.timeSlot}，参考价 {formatPrice(confirmed.estimate.total)}
                。最终价格以到店确认为准。
              </p>
            ) : null}

            <p className="form-note full">
              点提交会先在本地检查填写内容；本页面尚未接入后端，不会上传个人信息。
            </p>
            <button className="submit-btn full" type="submit">
              提交预约意向
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
