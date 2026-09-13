/**
 * @vitest-environment jsdom
 *
 * 预约表单的交互测试
 *
 * 前面几个测试文件都是“静态”的：渲染出来看看结构对不对。
 * 这个文件不一样，它模拟真人操作：往输入框里打字、选下拉框、点提交，
 * 然后检查页面有没有给出正确的提示。这是唯一能证明“表单真的会校验”的测试。
 *
 * 需要浏览器环境（jsdom），所以在文件第一行用 @vitest-environment 指定。
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import BookingSection from '../app/components/BookingSection';
import { addDays, toDateKey, BOOKING_WINDOW_DAYS } from '../lib/booking';

// 每个用例跑完把渲染出来的 DOM 清掉，避免互相干扰
afterEach(cleanup);

/** 明天的日期，保证落在可预约范围内（不写死日期，否则测试会随时间失效） */
function tomorrow(): string {
  return toDateKey(addDays(new Date(), 1));
}

/** 昨天，用来测“不能约过去的日期” */
function yesterday(): string {
  return toDateKey(addDays(new Date(), -1));
}

function typeInto(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /提交预约意向/ }));
}

describe('表单初始状态', () => {
  it('三个下拉框都有默认值', () => {
    render(<BookingSection />);
    expect((screen.getByLabelText(/宠物类型/) as HTMLSelectElement).value).toBe('小型犬');
    expect((screen.getByLabelText(/预约服务/) as HTMLSelectElement).value).toBe('基础香波洗护');
    expect((screen.getByLabelText(/期望时段/) as HTMLSelectElement).value).toBe('10:00 - 12:00');
  });

  it('刚打开时没有任何错误和成功提示', () => {
    render(<BookingSection />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('提交时会把问题指出来', () => {
  it('什么都不填就提交，会同时提示称呼、电话和日期', () => {
    render(<BookingSection />);
    submit();

    expect(screen.getByText('请填写主人称呼')).toBeTruthy();
    expect(screen.getByText('请填写联系电话')).toBeTruthy();
    expect(screen.getByText('请选择期望日期')).toBeTruthy();
  });

  it('会告诉用户一共还有几处要改', () => {
    render(<BookingSection />);
    submit();
    expect(screen.getByRole('alert').textContent).toContain('还有 3 处需要修改');
  });

  it('校验不通过时不会显示成功提示', () => {
    render(<BookingSection />);
    submit();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('手机号格式不对会被拦下', () => {
    render(<BookingSection />);
    typeInto(/联系电话/, '123');
    submit();
    expect(screen.getByText('请填写 11 位手机号，或带区号的固定电话')).toBeTruthy();
  });

  it('填过去的日期会被拦下', () => {
    render(<BookingSection />);
    typeInto(/期望日期/, yesterday());
    submit();
    expect(screen.getByText('期望日期不能早于今天')).toBeTruthy();
  });

  it('备注写太长会被拦下', () => {
    render(<BookingSection />);
    typeInto(/备注/, '字'.repeat(201));
    submit();
    expect(screen.getByText(/备注请控制在 200 个字以内/)).toBeTruthy();
  });

  it('填错的输入框会被标成 aria-invalid，读屏软件能知道这里有问题', () => {
    render(<BookingSection />);
    submit();
    expect(screen.getByLabelText(/主人称呼/).getAttribute('aria-invalid')).toBe('true');
  });
});

describe('边改边消掉错误提示', () => {
  it('开始补填称呼后，称呼那条提示会消失', () => {
    render(<BookingSection />);
    submit();
    expect(screen.getByText('请填写主人称呼')).toBeTruthy();

    typeInto(/主人称呼/, '陈女士');
    expect(screen.queryByText('请填写主人称呼')).toBeNull();
  });

  it('把电话改对之后，电话那条提示也会消失', () => {
    render(<BookingSection />);
    typeInto(/联系电话/, '123');
    submit();
    expect(screen.getByText('请填写 11 位手机号，或带区号的固定电话')).toBeTruthy();

    typeInto(/联系电话/, '138 0013 8000');
    expect(screen.queryByText(/请填写 11 位手机号/)).toBeNull();
  });
});

describe('填对了会给出参考价', () => {
  it('默认的小型犬 + 基础香波洗护是 ¥98', () => {
    render(<BookingSection />);
    typeInto(/主人称呼/, '陈女士');
    typeInto(/联系电话/, '13800138000');
    typeInto(/期望日期/, tomorrow());
    submit();

    const status = screen.getByRole('status').textContent ?? '';
    expect(status).toContain('小型犬 · 基础香波洗护');
    expect(status).toContain('¥98');
  });

  it('换成猫咪 + 造型美容修剪，参考价跟着变', () => {
    render(<BookingSection />);
    fireEvent.change(screen.getByLabelText(/宠物类型/), { target: { value: '猫咪' } });
    fireEvent.change(screen.getByLabelText(/预约服务/), { target: { value: '造型美容修剪' } });
    typeInto(/主人称呼/, '陈女士');
    typeInto(/联系电话/, '13800138000');
    typeInto(/期望日期/, tomorrow());
    submit();

    const status = screen.getByRole('status').textContent ?? '';
    expect(status).toContain('猫咪 · 造型美容修剪');
    expect(status).toContain('¥208');
  });

  it('成功后错误提示全部清空', () => {
    render(<BookingSection />);
    submit();
    expect(screen.getByRole('alert')).toBeTruthy();

    typeInto(/主人称呼/, '陈女士');
    typeInto(/联系电话/, '13800138000');
    typeInto(/期望日期/, tomorrow());
    submit();

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('提交成功后改动表单，成功提示会收起来（避免显示过期信息）', () => {
    render(<BookingSection />);
    typeInto(/主人称呼/, '陈女士');
    typeInto(/联系电话/, '13800138000');
    typeInto(/期望日期/, tomorrow());
    submit();
    expect(screen.getByRole('status')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/预约服务/), { target: { value: '局部护理' } });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('成功后照着提示带上日期和时段', () => {
    render(<BookingSection />);
    typeInto(/主人称呼/, '陈女士');
    typeInto(/联系电话/, '13912345678');
    typeInto(/期望日期/, tomorrow());
    submit();

    const status = screen.getByRole('status').textContent ?? '';
    expect(status).toContain(tomorrow());
    expect(status).toContain('10:00 - 12:00');
  });
});

describe('手机端填写体验', () => {
  it('电话框会唤起数字键盘，并支持浏览器自动填充', () => {
    render(<BookingSection />);
    const phone = screen.getByLabelText(/联系电话/);
    expect(phone.getAttribute('inputmode')).toBe('tel');
    expect(phone.getAttribute('autocomplete')).toBe('tel');
  });

  it('称呼框支持浏览器自动填充', () => {
    render(<BookingSection />);
    expect(screen.getByLabelText(/主人称呼/).getAttribute('autocomplete')).toBe('name');
  });

  it('日期框挂载后把可选范围限制在预约窗口内，点不出过去的日期', () => {
    render(<BookingSection />);
    const dateInput = screen.getByLabelText(/期望日期/);
    expect(dateInput.getAttribute('min')).toBe(toDateKey(new Date()));
    expect(dateInput.getAttribute('max')).toBe(
      toDateKey(addDays(new Date(), BOOKING_WINDOW_DAYS)),
    );
  });

  it('日期框的限制只是帮用户少走弯路，手动绕过它乱填仍然会被拦下', () => {
    // 用户可以直接在输入框里手打日期，所以校验逻辑不能因为有了 min/max 就省掉
    render(<BookingSection />);
    typeInto(/期望日期/, yesterday());
    submit();
    expect(screen.getByText('期望日期不能早于今天')).toBeTruthy();
  });
});

describe('提交失败时光标会自动跳到第一处错误', () => {
  it('空表单提交后，光标落在主人称呼上', () => {
    render(<BookingSection />);
    submit();
    expect(document.activeElement).toBe(screen.getByLabelText(/主人称呼/));
  });

  it('称呼填好后，光标落到下一个填错的字段（联系电话）', () => {
    render(<BookingSection />);
    typeInto(/主人称呼/, '陈女士');
    submit();

    expect(document.activeElement).toBe(screen.getByLabelText(/联系电话/));
  });

  it('电话也填对后，光标落到期望日期', () => {
    render(<BookingSection />);
    typeInto(/主人称呼/, '陈女士');
    typeInto(/联系电话/, '13800138000');
    submit();

    expect(document.activeElement).toBe(screen.getByLabelText(/期望日期/));
  });

  it('边打字边消除提示时，光标不会被抢走', () => {
    // 这条是防止有人图省事写成“只要 errors 变了就跳焦点”：
    // 那样用户在称呼里打字、称呼的错误提示一消失，焦点就会被抢到下一个字段，
    // 打着打着字就跑到别的格子里去了。
    render(<BookingSection />);
    submit();
    const nameInput = screen.getByLabelText(/主人称呼/);
    expect(document.activeElement).toBe(nameInput);

    typeInto(/主人称呼/, '陈女士');

    expect(document.activeElement).toBe(nameInput);
  });

  it('提交成功后不会把光标抢到别的地方', () => {
    render(<BookingSection />);
    typeInto(/主人称呼/, '陈女士');
    typeInto(/联系电话/, '13800138000');
    typeInto(/期望日期/, tomorrow());
    submit();

    expect(screen.getByRole('status')).toBeTruthy();
    // 成功时不需要跳焦点。这个过程里没有任何输入框被聚焦过，
    // 所以光标应该还老实待在 body 上，而不是被塞进某个输入框。
    expect(document.activeElement).toBe(document.body);
  });
});
