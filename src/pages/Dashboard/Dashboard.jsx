import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { format, subDays, isToday, parseISO } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="stat-card animate-fade-in">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-6 translate-x-6`}
      style={{ background: color }} />
    <div className="flex items-start justify-between">
      <div>
        <div className="label">{label}</div>
        <div className="text-2xl font-display tracking-widest mt-1" style={{ color }}>{value}</div>
        {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
      </div>
      <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
        <span style={{ color }}>{icon}</span>
      </div>
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <div className="text-white/50 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name !== 'Count' ? `₹${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const receipts = useSelector(s => s.lr.receipts)
  const entries = useSelector(s => s.daybook.entries)
  const customers = useSelector(s => s.customers.list)
  const navigate = useNavigate()

  const todayLRs = receipts.filter(r => isToday(parseISO(r.createdAt)))
  const totalFreight = receipts.reduce((a, r) => a + (parseFloat(r.totalFreight) || 0), 0)
  const pendingCount = receipts.filter(r => r.status === 'pending').length
  const deliveredCount = receipts.filter(r => r.status === 'delivered').length

  // Chart data: last 7 days LR count
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dayStr = format(d, 'yyyy-MM-dd')
    const count = receipts.filter(r => r.createdAt?.startsWith(dayStr)).length
    const freight = receipts
      .filter(r => r.createdAt?.startsWith(dayStr))
      .reduce((a, r) => a + (parseFloat(r.totalFreight) || 0), 0)
    return { day: format(d, 'EEE'), Count: count, Freight: freight }
  })

  // Daybook totals
  const todayEntries = entries.filter(e => e.date === format(new Date(), 'yyyy-MM-dd'))
  const todayIncome = todayEntries.filter(e => e.type === 'income').reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const todayExpense = todayEntries.filter(e => e.type === 'expense').reduce((a, e) => a + parseFloat(e.amount || 0), 0)

  const recentLRs = receipts.slice(0, 6)

  const statusColor = { pending: '#f97316', 'in-transit': '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444' }
  const statusLabel = { pending: 'Pending', 'in-transit': 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled' }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="section-title">Overview</div>
          <div className="page-title">DASHBOARD</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30">{format(new Date(), 'EEEE')}</div>
          <div className="text-sm font-mono text-white/60">{format(new Date(), 'dd MMM yyyy')}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's LRs"
          value={todayLRs.length}
          sub={`${receipts.length} total`}
          color="#f97316"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
        />
        <StatCard
          label="Total Freight"
          value={`₹${(totalFreight / 1000).toFixed(0)}K`}
          sub="All time"
          color="#22c55e"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          sub={`${deliveredCount} delivered`}
          color="#f59e0b"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
        />
        <StatCard
          label="Customers"
          value={customers.length}
          sub={`${customers.filter(c => c.status === 'active').length} active`}
          color="#3b82f6"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LR Trend */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="section-title mb-4">LR Trend – Last 7 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={last7}>
              <defs>
                <linearGradient id="freightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff40', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Freight" stroke="#ea580c" strokeWidth={2} fill="url(#freightGrad)" name="Freight" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Daybook */}
        <div className="glass-card p-5">
          <div className="section-title mb-4">Today's Cashflow</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div>
                <div className="text-xs text-white/40">Income</div>
                <div className="text-lg font-display text-green-400">₹{todayIncome.toLocaleString()}</div>
              </div>
              <div className="text-green-500/50">▲</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div>
                <div className="text-xs text-white/40">Expense</div>
                <div className="text-lg font-display text-red-400">₹{todayExpense.toLocaleString()}</div>
              </div>
              <div className="text-red-500/50">▼</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <div>
                <div className="text-xs text-white/40">Net Balance</div>
                <div className={`text-lg font-display ${todayIncome - todayExpense >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                  ₹{(todayIncome - todayExpense).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/daybook')} className="btn-secondary w-full mt-3 text-xs">
            View Daybook →
          </button>
        </div>
      </div>

      {/* Recent LRs */}
      <div className="glass-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="section-title">Recent LR Receipts</div>
          <button onClick={() => navigate('/lr-receipt')} className="btn-primary text-xs py-1.5">
            + New LR
          </button>
        </div>
        {recentLRs.length === 0 ? (
          <div className="py-12 text-center text-white/20 text-sm">No LR receipts yet. Create your first one!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="table-head">LR Number</th>
                  <th className="table-head">Date</th>
                  <th className="table-head">From → To</th>
                  <th className="table-head">Consignor</th>
                  <th className="table-head">Freight</th>
                  <th className="table-head">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLRs.map(lr => (
                  <tr key={lr.id} className="hover:bg-white/2 transition-colors cursor-pointer"
                    onClick={() => navigate('/lr-receipt')}>
                    <td className="table-cell">
                      <span className="font-mono text-brand-400 text-xs">{lr.lrNumber}</span>
                    </td>
                    <td className="table-cell text-white/50">
                      {format(parseISO(lr.createdAt), 'dd/MM/yy')}
                    </td>
                    <td className="table-cell">
                      <span className="text-white/60">{lr.from}</span>
                      <span className="text-white/30 mx-1">→</span>
                      <span className="text-white/60">{lr.to}</span>
                    </td>
                    <td className="table-cell">{lr.consignorName}</td>
                    <td className="table-cell font-mono text-sm">
                      ₹{parseFloat(lr.totalFreight || 0).toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <span className="badge" style={{
                        background: `${statusColor[lr.status]}20`,
                        color: statusColor[lr.status]
                      }}>
                        {statusLabel[lr.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
