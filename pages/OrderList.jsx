import { useMemo, useState } from 'react'
import { getStatus, money, profitOf } from '../lib/order'

const TABS = [
  { id: 'pending', label: '待收货' },
  { id: 'stock', label: '当前库存' },
  { id: 'sold', label: '已售出' },
]

export default function OrderList({
  orders,
  initialTab,
  highlightId,
  onSell,
}) {
  const [tab, setTab] = useState(initialTab || 'stock')

  const list = useMemo(
    () => orders.filter((o) => getStatus(o) === tab),
    [orders, tab],
  )

  return (
    <div className="space-y-5">
      <header className="pt-1">
        <p className="text-xs tracking-widest text-muted">ORDERS</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight">全部订单</h1>
      </header>

      <div className="flex rounded-full bg-card p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-full py-2 text-xs ${
              tab === item.id ? 'bg-ink text-white' : 'text-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">这一栏暂时没有单据。</p>
      ) : (
        <ul className="space-y-3">
          {list.map((order) => (
            <li
              key={order.id}
              className={`rounded-3xl bg-card px-4 py-4 ${
                highlightId === order.id ? 'ring-1 ring-warn/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium">{order.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {order.spec || '未填规格'}
                    {order.sn ? ` · ${order.sn}` : ''}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium">¥{money(order.buyPrice)}</p>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted">
                {order.buyChannel || '未填渠道'} · {order.payChannel || '未填付款'}
                {order.signDate ? ` · 签收 ${order.signDate}` : ` · 下单 ${order.orderDate}`}
              </p>

              {tab === 'stock' && (
                <button
                  type="button"
                  onClick={() => onSell(order)}
                  className="mt-3 w-full rounded-full bg-paper py-2.5 text-sm"
                >
                  登记售出
                </button>
              )}

              {tab === 'sold' && order.sold && (
                <div className="mt-3 flex items-end justify-between gap-3 rounded-2xl bg-paper px-3 py-3">
                  <div>
                    <p className="text-xs text-muted">
                      {order.sold.sellChannel} · {order.sold.settled ? '已结算' : '未结算'}
                    </p>
                    <p className="mt-1 text-xs text-muted">卖出 ¥{money(order.sold.sellPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted">实际净利润</p>
                    <p className="mt-0.5 text-sm font-semibold text-profit">
                      ¥{money(profitOf(order))}
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
