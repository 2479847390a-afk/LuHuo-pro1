import { useState } from 'react'
import { Camera } from 'lucide-react'
import { BUY_CHANNELS, PAY_CHANNELS } from '../data/mockOrders'
import { todayISO } from '../lib/order'

const emptyForm = () => ({
  name: '',
  spec: '',
  sn: '',
  orderDate: todayISO(),
  buyChannel: '',
  payChannel: '',
  buyPrice: '',
  commission: '',
  rebate: '',
  canInvoice: false,
  trackingNo: '',
  signDate: '',
})

export default function AddOrder({ onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [hint, setHint] = useState('')
  const [saved, setSaved] = useState('')

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function scanPlaceholder(field) {
    setHint(`${field}扫码稍后接入，可先手动填写`)
    window.setTimeout(() => setHint(''), 1800)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setHint('请先填写品名')
      return
    }
    onSubmit({
      ...form,
      name: form.name.trim(),
      spec: form.spec.trim(),
      sn: form.sn.trim(),
      buyChannel: form.buyChannel.trim(),
      payChannel: form.payChannel.trim(),
      trackingNo: form.trackingNo.trim(),
    })
    setForm(emptyForm())
    setSaved(form.signDate ? '已签收库存' : '待收货')
    window.setTimeout(() => setSaved(''), 2200)
  }

  const statusLabel = form.signDate ? '已签收库存' : '待收货'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header className="pt-1">
        <p className="text-xs tracking-widest text-muted">NEW ORDER</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight">入库建单</h1>
      </header>

      <Section title="基础信息">
        <Field label="品名">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="例如：索尼 WH-1000XM5"
            className="field"
          />
        </Field>
        <Field label="规格">
          <input
            value={form.spec}
            onChange={(e) => set('spec', e.target.value)}
            placeholder="颜色 / 版本 / 容量"
            className="field"
          />
        </Field>
        <Field label="商品 SN 码">
          <div className="relative">
            <input
              value={form.sn}
              onChange={(e) => set('sn', e.target.value)}
              placeholder="序列号"
              className="field pr-11"
            />
            <button
              type="button"
              aria-label="扫描 SN"
              onClick={() => scanPlaceholder('SN')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted"
            >
              <Camera size={18} />
            </button>
          </div>
        </Field>
      </Section>

      <Section title="成本信息">
        <div className="grid grid-cols-2 gap-3">
          <Field label="下单日期">
            <input
              type="date"
              value={form.orderDate}
              onChange={(e) => set('orderDate', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="买入单价">
            <input
              inputMode="decimal"
              value={form.buyPrice}
              onChange={(e) => set('buyPrice', e.target.value)}
              placeholder="0.00"
              className="field"
            />
          </Field>
        </div>
        <Field label="买入账号渠道">
          <input
            list="buy-channels"
            value={form.buyChannel}
            onChange={(e) => set('buyChannel', e.target.value)}
            placeholder="如：张三淘宝"
            className="field"
          />
          <datalist id="buy-channels">
            {BUY_CHANNELS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="付款渠道">
          <input
            list="pay-channels"
            value={form.payChannel}
            onChange={(e) => set('payChannel', e.target.value)}
            placeholder="如：招商信用卡"
            className="field"
          />
          <datalist id="pay-channels">
            {PAY_CHANNELS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="代下佣金">
            <input
              inputMode="decimal"
              value={form.commission}
              onChange={(e) => set('commission', e.target.value)}
              placeholder="0.00"
              className="field"
            />
          </Field>
          <Field label="平台返利">
            <input
              inputMode="decimal"
              value={form.rebate}
              onChange={(e) => set('rebate', e.target.value)}
              placeholder="0.00"
              className="field"
            />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-paper px-3 py-3">
          <p className="text-sm">是否可开专票</p>
          <button
            type="button"
            role="switch"
            aria-checked={form.canInvoice}
            onClick={() => set('canInvoice', !form.canInvoice)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              form.canInvoice ? 'bg-ink' : 'bg-line'
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-sm transition-transform ${
                form.canInvoice ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </Section>

      <Section title="物流信息">
        <Field label="入库快递单号">
          <div className="relative">
            <input
              value={form.trackingNo}
              onChange={(e) => set('trackingNo', e.target.value)}
              placeholder="快递单号"
              className="field pr-11"
            />
            <button
              type="button"
              aria-label="扫描快递单号"
              onClick={() => scanPlaceholder('快递单号')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted"
            >
              <Camera size={18} />
            </button>
          </div>
        </Field>
        <Field label="签收日期">
          <input
            type="date"
            value={form.signDate}
            onChange={(e) => set('signDate', e.target.value)}
            className="field"
          />
          <p className="mt-2 text-xs text-muted">
            当前状态：
            <span className="ml-1 text-ink">{statusLabel}</span>
            {form.signDate ? '' : '（不填签收日期即为待收货）'}
          </p>
        </Field>
      </Section>

      {(hint || saved) && (
        <p className={`text-center text-sm ${saved ? 'text-profit' : 'text-muted'}`}>
          {saved ? `已保存为「${saved}」` : hint}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-ink py-3.5 text-sm font-medium text-white"
      >
        保存入库
      </button>
    </form>
  )
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl bg-card px-4 py-4">
      <h2 className="mb-3 text-xs tracking-widest text-muted">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      {children}
    </label>
  )
}
