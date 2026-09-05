import { ClipboardList, LayoutGrid, Plus } from 'lucide-react'

const items = [
  { id: 'dashboard', label: '概览', Icon: LayoutGrid },
  { id: 'add', label: '入库', Icon: Plus },
  { id: 'orders', label: '订单', Icon: ClipboardList },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md bg-paper/90 backdrop-blur-md">
      <div className="grid grid-cols-3 px-2 pt-2 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
        {items.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] ${
                active ? 'text-ink' : 'text-muted'
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  active ? 'bg-card shadow-sm' : ''
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
