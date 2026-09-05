import { useState } from 'react'
import { X } from 'lucide-react'

export default function SellDialog({ order, onClose, onConfirm }) {
  const [sellChannel, setSellChannel] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [settled, setSettled] = useState(false)
  const [hint, setHint] = useState('')

  if (!order) return null

  function submit(e) {
    e.preventDefault()
    if (!sellChannel.trim() || !sellPrice) {
      setHint('请填写出货人与卖出单价')
      return
    }
    onConfirm(order.id, {
      sellChannel: sellChannel.trim(),
      sellPrice,
      settled,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30">
      <button type="button" className="absolute inset-0" aria-label="关闭" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-t-[28px] bg-card px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">登记售出</p>
            <h2 className="mt-0.5 text-lg font-semibold">{order.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-muted">
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted">卖出渠道 / 出货人</span>
          <input
            value={sellChannel}
            onChange={(e) => setSellChannel(e.target.value)}
            placeholder="如：闲鱼 / 阿伟"
            className="field"
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs text-muted">卖出单价</span>
          <input
            inputMode="decimal"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="0.00"
            className="field"
          />
        </label>

        <div className="mt-3">
          <p className="mb-1.5 text-xs text-muted">回款状态</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: false, label: '未结算' },
              { value: true, label: '已结算' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setSettled(opt.value)}
                className={`rounded-2xl py-2.5 text-sm ${
                  settled === opt.value ? 'bg-ink text-white' : 'bg-paper text-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {hint && <p className="mt-3 text-center text-sm text-warn">{hint}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-ink py-3.5 text-sm font-medium text-white"
        >
          确认出库
        </button>
      </form>
    </div>
  )
}
