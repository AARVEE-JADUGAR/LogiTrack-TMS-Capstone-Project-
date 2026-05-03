import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { format, parseISO } from 'date-fns'
import {
  addEntry, updateEntry, deleteEntry, setFilterDate, setFilterType
} from '../../store/slices/daybookSlice'

const categories = {
  income: ['Freight Income', 'Advance Received', 'Commission', 'Other Income'],
  expense: ['Fuel', 'Driver Salary', 'Vehicle Repair', 'Toll & Taxes', 'Office Expense', 'Loading/Unloading', 'Tyre & Parts', 'Insurance', 'Other Expense'],
}

const defaultForm = {
  date: format(new Date(), 'yyyy-MM-dd'),
  type: 'income',
  category: '',
  description: '',
  amount: '',
  paymentMethod: 'cash',
  reference: '',
  lrNumber: '',
}

export default function DaybookPage() {
  const dispatch = useDispatch()
  const { entries, filterDate, filterType } = useSelector(s => s.daybook)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const setFormField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const filtered = entries.filter(e => {
    const matchDate = !filterDate || e.date === filterDate
    const matchType = filterType === 'all' || e.type === filterType
    return matchDate && matchType
  })

  const totalIncome = filtered.filter(e => e.type === 'income').reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  const totalExpense = filtered.filter(e => e.type === 'expense').reduce((a, e) => a + parseFloat(e.amount || 0), 0)

  const openForm = (entry = null) => {
    setEditingEntry(entry)
    setForm(entry ? { ...entry } : defaultForm)
    setShowForm(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editingEntry) {
      dispatch(updateEntry({ ...editingEntry, ...form }))
    } else {
      dispatch(addEntry(form))
    }
    setShowForm(false)
    setEditingEntry(null)
    setForm(defaultForm)
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
  ]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="section-title">Financial Records</div>
          <div className="page-title">DAYBOOK</div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => openForm()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="label">Total Income</div>
          <div className="text-xl font-display text-green-400">₹{totalIncome.toLocaleString()}</div>
          <div className="text-xs text-white/30 mt-1">{filtered.filter(e => e.type === 'income').length} entries</div>
        </div>
        <div className="glass-card p-4">
          <div className="label">Total Expense</div>
          <div className="text-xl font-display text-red-400">₹{totalExpense.toLocaleString()}</div>
          <div className="text-xs text-white/30 mt-1">{filtered.filter(e => e.type === 'expense').length} entries</div>
        </div>
        <div className="glass-card p-4">
          <div className="label">Net Balance</div>
          <div className={`text-xl font-display ${totalIncome - totalExpense >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
            ₹{(totalIncome - totalExpense).toLocaleString()}
          </div>
          <div className="text-xs text-white/30 mt-1">{filtered.length} total entries</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex gap-4 items-center flex-wrap">
        <div>
          <label className="label">Filter Date</label>
          <input type="date" className="input-field w-44" value={filterDate}
            onChange={e => dispatch(setFilterDate(e.target.value))} />
        </div>
        <div className="flex gap-2 items-end pb-0.5">
          {tabs.map(t => (
            <button key={t.key}
              onClick={() => dispatch(setFilterType(t.key))}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterType === t.key ? 'bg-brand-600 text-white' : 'bg-dark-600 text-white/40 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="text-xs text-white/30 hover:text-white ml-auto" onClick={() => dispatch(setFilterDate(''))}>
          Clear Date Filter
        </button>
      </div>

      {/* Entries Table */}
      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📒</div>
            <div className="text-white/30 text-sm">No entries for selected filters</div>
            <button className="btn-primary mt-4" onClick={() => openForm()}>Add First Entry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="table-head">Date</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Category</th>
                  <th className="table-head">Description</th>
                  <th className="table-head">LR / Ref.</th>
                  <th className="table-head">Payment</th>
                  <th className="table-head text-right">Amount</th>
                  <th className="table-head"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-white/2 transition-colors group">
                    <td className="table-cell font-mono text-xs text-white/50">
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${entry.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {entry.type === 'income' ? '▲ Income' : '▼ Expense'}
                      </span>
                    </td>
                    <td className="table-cell text-white/70 text-xs">{entry.category}</td>
                    <td className="table-cell">{entry.description}</td>
                    <td className="table-cell text-white/40 text-xs font-mono">{entry.lrNumber || entry.reference || '—'}</td>
                    <td className="table-cell">
                      <span className="badge bg-dark-500 text-white/40 capitalize">{entry.paymentMethod}</span>
                    </td>
                    <td className="table-cell text-right">
                      <span className={`font-mono font-bold ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.type === 'income' ? '+' : '-'}₹{parseFloat(entry.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openForm(entry)}
                          className="p-1.5 rounded bg-brand-500/20 text-brand-400 hover:bg-brand-500/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(entry.id)}
                          className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Running balance row */}
              <tfoot>
                <tr className="bg-dark-700 border-t border-brand-500/20">
                  <td colSpan={6} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50">
                    {filterDate ? `Total for ${format(new Date(filterDate), 'dd MMM yyyy')}` : 'Grand Total'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-xs text-green-400 font-mono">+₹{totalIncome.toLocaleString()}</div>
                    <div className="text-xs text-red-400 font-mono">-₹{totalExpense.toLocaleString()}</div>
                    <div className={`text-sm font-bold font-mono ${totalIncome - totalExpense >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                      = ₹{(totalIncome - totalExpense).toLocaleString()}
                    </div>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="font-display text-xl tracking-widest">{editingEntry ? 'EDIT ENTRY' : 'NEW ENTRY'}</div>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input className="input-field" type="date" value={form.date} onChange={e => setFormField('date', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <div className="flex gap-2">
                    {['income', 'expense'].map(t => (
                      <button key={t} type="button"
                        onClick={() => setFormField('type', t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${form.type === t ? (t === 'income' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-dark-600 text-white/40'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setFormField('category', e.target.value)} required>
                    <option value="">Select category...</option>
                    {(categories[form.type] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Amount (₹)</label>
                  <input className="input-field font-mono" type="number" min="0" step="0.01"
                    value={form.amount} onChange={e => setFormField('amount', e.target.value)} placeholder="0.00" required />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input-field" value={form.description} onChange={e => setFormField('description', e.target.value)} placeholder="Brief description..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Payment Method</label>
                  <select className="input-field" value={form.paymentMethod} onChange={e => setFormField('paymentMethod', e.target.value)}>
                    {['cash', 'bank', 'upi', 'cheque', 'neft', 'rtgs'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">LR Number (optional)</label>
                  <input className="input-field font-mono" value={form.lrNumber} onChange={e => setFormField('lrNumber', e.target.value)} placeholder="LR-123456" />
                </div>
              </div>
              <div>
                <label className="label">Reference No.</label>
                <input className="input-field" value={form.reference} onChange={e => setFormField('reference', e.target.value)} placeholder="Invoice / voucher no." />
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary px-8">{editingEntry ? 'Update Entry' : 'Add Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-72 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-bold mb-4">Delete this entry?</div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger flex-1" onClick={() => { dispatch(deleteEntry(deleteConfirm)); setDeleteConfirm(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
