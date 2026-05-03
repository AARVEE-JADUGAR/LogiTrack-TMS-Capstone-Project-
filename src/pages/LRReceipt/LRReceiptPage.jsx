import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { format, parseISO } from 'date-fns'
import {
  addReceipt, updateReceipt, deleteReceipt,
  setSelectedReceipt, setFilter, setSearchQuery, updateStatus
} from '../../store/slices/lrSlice'
import LRForm from './LRForm'
import LRPrintView from './LRPrintView'

const statusColor = { pending: '#f97316', 'in-transit': '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444' }
const statusLabel = { pending: 'Pending', 'in-transit': 'In Transit', delivered: 'Delivered', cancelled: 'Cancelled' }

export default function LRReceiptPage() {
  const dispatch = useDispatch()
  const { receipts, selectedReceipt, filter, searchQuery } = useSelector(s => s.lr)
  const [showForm, setShowForm] = useState(false)
  const [editingLR, setEditingLR] = useState(null)
  const [printLR, setPrintLR] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = receipts.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || r.lrNumber?.toLowerCase().includes(q)
      || r.consignorName?.toLowerCase().includes(q)
      || r.consigneeName?.toLowerCase().includes(q)
      || r.from?.toLowerCase().includes(q)
      || r.to?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const handleSave = (data) => {
    if (editingLR) {
      dispatch(updateReceipt({ ...editingLR, ...data }))
    } else {
      dispatch(addReceipt(data))
    }
    setShowForm(false)
    setEditingLR(null)
  }

  const handleEdit = (lr) => {
    setEditingLR(lr)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    dispatch(deleteReceipt(id))
    setDeleteConfirm(null)
  }

  const filters = ['all', 'pending', 'in-transit', 'delivered', 'cancelled']
  const counts = Object.fromEntries(filters.map(f => [f, f === 'all' ? receipts.length : receipts.filter(r => r.status === f).length]))

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="section-title">Freight Management</div>
          <div className="page-title">LR RECEIPTS</div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditingLR(null); setShowForm(true) }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New LR Receipt
        </button>
      </div>

      {/* Filters + Search */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => dispatch(setFilter(f))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-brand-600 text-white' : 'bg-dark-600 text-white/40 hover:text-white'}`}
            >
              {f === 'all' ? 'All' : statusLabel[f]} <span className="ml-1 opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input-field pl-9 w-60"
            placeholder="Search LR, consignor, route..."
            value={searchQuery}
            onChange={e => dispatch(setSearchQuery(e.target.value))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-white/10 text-5xl mb-3">📋</div>
            <div className="text-white/30 text-sm">No LR receipts found</div>
            <button className="btn-primary mt-4" onClick={() => { setEditingLR(null); setShowForm(true) }}>
              Create First LR
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="table-head">LR Number</th>
                  <th className="table-head">Date</th>
                  <th className="table-head">Route</th>
                  <th className="table-head">Consignor</th>
                  <th className="table-head">Consignee</th>
                  <th className="table-head">Pkgs</th>
                  <th className="table-head">Freight</th>
                  <th className="table-head">Pay Mode</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lr => (
                  <tr key={lr.id} className="hover:bg-white/2 transition-colors group">
                    <td className="table-cell">
                      <span className="font-mono text-brand-400 text-xs font-bold">{lr.lrNumber}</span>
                    </td>
                    <td className="table-cell text-white/50 font-mono text-xs">
                      {format(parseISO(lr.createdAt), 'dd/MM/yy')}
                    </td>
                    <td className="table-cell">
                      <span className="text-white/70 text-xs">{lr.from}</span>
                      <span className="text-white/20 mx-1">→</span>
                      <span className="text-white/70 text-xs">{lr.to}</span>
                    </td>
                    <td className="table-cell text-sm">{lr.consignorName}</td>
                    <td className="table-cell text-sm text-white/60">{lr.consigneeName}</td>
                    <td className="table-cell text-center">{lr.totalPackages || '-'}</td>
                    <td className="table-cell font-mono font-bold text-sm">
                      ₹{parseFloat(lr.totalFreight || 0).toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${lr.paymentMode === 'paid' ? 'bg-green-500/20 text-green-400' : lr.paymentMode === 'to-pay' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {lr.paymentMode === 'to-pay' ? 'To Pay' : lr.paymentMode === 'paid' ? 'Paid' : 'TBB'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <select
                        value={lr.status}
                        onChange={e => dispatch(updateStatus({ id: lr.id, status: e.target.value }))}
                        className="bg-transparent text-xs font-bold rounded px-1 py-0.5 border-0 cursor-pointer"
                        style={{ color: statusColor[lr.status] }}
                      >
                        {Object.entries(statusLabel).map(([v, l]) => (
                          <option key={v} value={v} className="bg-dark-700 text-white">{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPrintLR(lr)}
                          className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" title="Print">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                            <rect x="6" y="14" width="12" height="8"/>
                          </svg>
                        </button>
                        <button onClick={() => handleEdit(lr)}
                          className="p-1.5 rounded bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors" title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(lr.id)}
                          className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors" title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
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

      {/* LR Form Modal */}
      {showForm && (
        <LRForm
          initial={editingLR}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingLR(null) }}
        />
      )}

      {/* Print Modal */}
      {printLR && <LRPrintView lr={printLR} onClose={() => setPrintLR(null)} />}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-80 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-bold text-lg mb-2">Delete LR Receipt?</div>
            <div className="text-white/40 text-sm mb-5">This action cannot be undone.</div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger flex-1" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
