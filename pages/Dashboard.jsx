import { AlertTriangle, Plus } from 'lucide-react'
import { costOf, daysSince, isRiskStock, money, profitOf } from '../lib/order'

export default function Dashboard({ orders, onAdd, onOpenOrder }) {
  const invested = orders.reduce((s, o) => s + costOf(o), 0)
  const unpaid = orders.reduce((s, o) => {
    if (o.sold?.settled) return s
    if (o.sold) return s + Number(o.sold.sellPrice)
    return s + costOf(o)
  }, 0)
  const profit = orders.reduce((s, o) => s + profitOf(o), 0)
  const risks = orders.filter(isRiskStock)

  return (
    <div className="space-y-5">
      <header className="pt-1">
        <p className="text-xs tracking-widest text-muted">LUHUO</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight">概览</h1>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <Stat label="总投入" value={money(invested)} />
        <Stat label="未回款" value={money(unpaid)} />
        <Stat label="总纯利润" value={money(profit)} accent />
      </section>

      <section className="rounded-3xl bg-warn-bg px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card">
            <AlertTriangle size={16} className="text-warn" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-warn">风险预警</p>
            <p className="mt-0.5 text-xs leading-relaxed text-warn/80">
              已签收未售出超过 5 天，即将超过 7 天无理由退货期
            </p>
          </div>
        </div>

        {risks.length === 0 ? (
          <p className="mt-3 text-sm text-muted">暂无超期库存，状态良好。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {risks.map((item) => {
              const days = daysSince(item.signDate)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onOpenOrder(item.id)}
                    className="w-full rounded-2xl bg-card px-3 py-3 text-left"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="shrink-0 text-xs text-warn">已放 {days} 天</p>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {item.spec} · 签收 {item.signDate}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-white"
      >
        <Plus size={18} />
        快捷入库
      </button>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-3xl bg-card px-3 py-4">
      <p className="text-[11px] text-muted">{label}</p>
      <p
        className={`mt-2 text-[15px] font-semibold tracking-tight ${
          accent ? 'text-profit' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
