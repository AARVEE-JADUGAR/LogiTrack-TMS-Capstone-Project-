import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { format, parseISO } from 'date-fns'
import {
  addCustomer, updateCustomer, deleteCustomer,
  setSearchQuery, setFilterType, setFilterStatus
} from '../../store/slices/customerSlice'

const defaultForm = {
  name: '',
  contact: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  gst: '',
  pan: '',
  type: 'consignor',
  status: 'active',
  creditLimit: '',
  notes: '',
}

export default function CustomersPage() {
  const dispatch = useDispatch()
  const { list, searchQuery, filterType, filterStatus } = useSelector(s => s.customers)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [viewCustomer, setViewCustomer] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const filtered = list.filter(c => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
      || c.city?.toLowerCase().includes(q) || c.gst?.toLowerCase().includes(q)
    const matchType = filterType === 'all' || c.type === filterType
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const openForm = (c = null) => {
    setEditing(c)
    setForm(c ? { ...c } : defaultForm)
    setShowForm(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editing) {
      dispatch(updateCustomer({ ...editing, ...form }))
    } else {
      dispatch(addCustomer(form))
    }
    setShowForm(false)
    setEditing(null)
  }

  const typeColor = { consignor: 'text-brand-400 bg-brand-500/20', consignee: 'text-blue-400 bg-blue-500/20', both: 'text-purple-400 bg-purple-500/20' }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="section-title">Party Management</div>
          <div className="page-title">CUSTOMERS</div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => openForm()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'Total', v: list.length, c: '#f97316' },
          { l: 'Consignors', v: list.filter(c => c.type === 'consignor' || c.type === 'both').length, c: '#ea580c' },
          { l: 'Consignees', v: list.filter(c => c.type === 'consignee' || c.type === 'both').length, c: '#3b82f6' },
          { l: 'Active', v: list.filter(c => c.status === 'active').length, c: '#22c55e' },
        ].map(s => (
          <div key={s.l} className="glass-card p-4">
            <div className="label">{s.l}</div>
            <div className="text-xl font-display" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="input-field pl-9 w-60" placeholder="Search by name, phone, city, GST..."
            value={searchQuery} onChange={e => dispatch(setSearchQuery(e.target.value))} />
        </div>
        <div className="flex gap-2">
          {['all', 'consignor', 'consignee', 'both'].map(t => (
            <button key={t} onClick={() => dispatch(setFilterType(t))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterType === t ? 'bg-brand-600 text-white' : 'bg-dark-600 text-white/40 hover:text-white'}`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(s => (
            <button key={s} onClick={() => dispatch(setFilterStatus(s))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === s ? 'bg-brand-600 text-white' : 'bg-dark-600 text-white/40 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">👥</div>
            <div className="text-white/30 text-sm">No customers found</div>
            <button className="btn-primary mt-4" onClick={() => openForm()}>Add First Customer</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="table-head">Name</th>
                  <th className="table-head">Contact</th>
                  <th className="table-head">Phone</th>
                  <th className="table-head">City</th>
                  <th className="table-head">GST</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Shipments</th>
                  <th className="table-head">Outstanding</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors group cursor-pointer"
                    onClick={() => setViewCustomer(c)}>
                    <td className="table-cell font-semibold">{c.name}</td>
                    <td className="table-cell text-white/60">{c.contact}</td>
                    <td className="table-cell font-mono text-xs text-white/60">{c.phone}</td>
                    <td className="table-cell text-white/60">{c.city}</td>
                    <td className="table-cell font-mono text-xs text-white/40">{c.gst || '—'}</td>
                    <td className="table-cell" onClick={e => e.stopPropagation()}>
                      <span className={`badge capitalize ${typeColor[c.type]}`}>{c.type}</span>
                    </td>
                    <td className="table-cell text-center">{c.totalShipments || 0}</td>
                    <td className="table-cell">
                      <span className={parseFloat(c.outstanding) > 0 ? 'text-red-400 font-mono' : 'text-green-400 font-mono'}>
                        ₹{parseFloat(c.outstanding || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="table-cell" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openForm(c)} className="p-1.5 rounded bg-brand-500/20 text-brand-400 hover:bg-brand-500/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="glass-card w-full max-w-2xl my-4 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="font-display text-xl tracking-widest">{editing ? 'EDIT CUSTOMER' : 'NEW CUSTOMER'}</div>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Name <span className="text-red-400">*</span></label>
                  <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Company / firm name" />
                </div>
                <div>
                  <label className="label">Contact Person</label>
                  <input className="input-field" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Person name" />
                </div>
                <div>
                  <label className="label">Phone <span className="text-red-400">*</span></label>
                  <input className="input-field font-mono" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="10-digit mobile" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
                </div>
                <div>
                  <label className="label">GST Number</label>
                  <input className="input-field font-mono" value={form.gst} onChange={e => set('gst', e.target.value)} placeholder="27AABCU9603R1ZX" />
                </div>
                <div>
                  <label className="label">PAN Number</label>
                  <input className="input-field font-mono" value={form.pan} onChange={e => set('pan', e.target.value)} placeholder="AABCU9603R" />
                </div>
                <div>
                  <label className="label">Credit Limit (₹)</label>
                  <input className="input-field" type="number" value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className="label">Customer Type</label>
                  <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="consignor">Consignor (Sender)</option>
                    <option value="consignee">Consignee (Receiver)</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <textarea className="input-field h-16 resize-none" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address..." />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input-field h-14 resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes..." />
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary px-8">{editing ? 'Update' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Detail */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="font-display text-lg tracking-widest">CUSTOMER PROFILE</div>
              <button onClick={() => setViewCustomer(null)} className="text-white/30 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-600/20 rounded-full flex items-center justify-center text-brand-400 text-2xl font-display">
                  {viewCustomer.name[0]}
                </div>
                <div>
                  <div className="font-bold text-lg">{viewCustomer.name}</div>
                  <div className="text-white/40 text-sm">{viewCustomer.contact}</div>
                  <span className={`badge capitalize ${typeColor[viewCustomer.type]}`}>{viewCustomer.type}</span>
                </div>
              </div>
              {[
                ['Phone', viewCustomer.phone],
                ['Email', viewCustomer.email],
                ['City', viewCustomer.city],
                ['Address', viewCustomer.address],
                ['GST', viewCustomer.gst],
                ['PAN', viewCustomer.pan],
                ['Credit Limit', viewCustomer.creditLimit ? `₹${parseFloat(viewCustomer.creditLimit).toLocaleString()}` : '—'],
                ['Outstanding', `₹${parseFloat(viewCustomer.outstanding || 0).toLocaleString()}`],
                ['Total Shipments', viewCustomer.totalShipments],
              ].map(([l, v]) => v ? (
                <div key={l} className="flex items-start gap-3">
                  <div className="text-xs text-white/30 w-28 shrink-0 pt-0.5">{l}</div>
                  <div className="text-sm font-mono text-white/80 flex-1">{v}</div>
                </div>
              ) : null)}
              {viewCustomer.notes && (
                <div className="p-3 rounded-lg bg-dark-700 text-sm text-white/50 italic">{viewCustomer.notes}</div>
              )}
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button className="btn-secondary flex-1" onClick={() => setViewCustomer(null)}>Close</button>
                <button className="btn-primary flex-1" onClick={() => { setViewCustomer(null); openForm(viewCustomer) }}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-72 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-bold mb-4">Delete this customer?</div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger flex-1" onClick={() => { dispatch(deleteCustomer(deleteConfirm)); setDeleteConfirm(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
