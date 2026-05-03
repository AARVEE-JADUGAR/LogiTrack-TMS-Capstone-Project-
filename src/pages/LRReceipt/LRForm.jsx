import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { format } from 'date-fns'

const defaultForm = {
  date: format(new Date(), 'yyyy-MM-dd'),
  consignorName: '',
  consignorAddress: '',
  consignorGST: '',
  consigneeName: '',
  consigneeAddress: '',
  consigneeGST: '',
  from: '',
  to: '',
  vehicleNumber: '',
  driverName: '',
  description: '',
  totalPackages: '',
  actualWeight: '',
  chargedWeight: '',
  freightPerUnit: '',
  totalFreight: '',
  hamali: '',
  cartage: '',
  otherCharges: '',
  grandTotal: '',
  paymentMode: 'to-pay',
  invoiceNumber: '',
  eWayBill: '',
  remarks: '',
}

export default function LRForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? {
    ...defaultForm, ...initial
  } : defaultForm)

  const settings = useSelector(s => s.settings)
  const customers = useSelector(s => s.customers.list)

  const set = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      // Auto calculate grand total
      if (['totalFreight', 'hamali', 'cartage', 'otherCharges'].includes(key)) {
        const freight = parseFloat(next.totalFreight) || 0
        const hamali = parseFloat(next.hamali) || 0
        const cartage = parseFloat(next.cartage) || 0
        const other = parseFloat(next.otherCharges) || 0
        next.grandTotal = (freight + hamali + cartage + other).toFixed(2)
      }
      // Auto calculate total freight
      if (['chargedWeight', 'freightPerUnit'].includes(key)) {
        const wt = parseFloat(next.chargedWeight) || 0
        const rate = parseFloat(next.freightPerUnit) || 0
        next.totalFreight = (wt * rate).toFixed(2)
        const hamali = parseFloat(next.hamali) || 0
        const cartage = parseFloat(next.cartage) || 0
        const other = parseFloat(next.otherCharges) || 0
        next.grandTotal = (wt * rate + hamali + cartage + other).toFixed(2)
      }
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  const Field = ({ label, name, type = 'text', placeholder = '', options, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      {options ? (
        <select className="input-field" value={form[name]} onChange={e => set(name, e.target.value)} required={required}>
          <option value="">Select...</option>
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input
          className="input-field"
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          required={required}
        />
      )}
    </div>
  )

  const consignorOptions = customers.filter(c => c.type === 'consignor' || c.type === 'both').map(c => ({ value: c.name, label: c.name }))
  const consigneeOptions = customers.filter(c => c.type === 'consignee' || c.type === 'both').map(c => ({ value: c.name, label: c.name }))
  const vehicleOptions = settings.vehicles.map(v => ({ value: v.number, label: `${v.number} (${v.type})` }))
  const routeFromOptions = [...new Set(settings.routes.map(r => r.from))]
  const routeToOptions = [...new Set(settings.routes.map(r => r.to))]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="glass-card w-full max-w-4xl my-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <div className="section-title">Freight Document</div>
            <div className="text-xl font-display tracking-widest">{initial ? 'EDIT LR RECEIPT' : 'NEW LR RECEIPT'}</div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="section-title mb-3">Basic Information</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Date" name="date" type="date" required />
              <Field label="Invoice / Bill No." name="invoiceNumber" placeholder="INV-001" />
              <Field label="E-Way Bill No." name="eWayBill" placeholder="EWB123456" />
              <Field label="Payment Mode" name="paymentMode" options={[
                { value: 'to-pay', label: 'To Pay' },
                { value: 'paid', label: 'Paid' },
                { value: 'tbb', label: 'TBB (To Be Billed)' },
              ]} required />
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="section-title">Consignor (Sender)</div>
              <div>
                <label className="label">Name <span className="text-red-400">*</span></label>
                <input className="input-field" list="consignor-list" value={form.consignorName}
                  onChange={e => set('consignorName', e.target.value)} placeholder="Consignor name" required />
                <datalist id="consignor-list">
                  {consignorOptions.map(o => <option key={o.value} value={o.value} />)}
                </datalist>
              </div>
              <Field label="Address" name="consignorAddress" placeholder="Full address" />
              <Field label="GST Number" name="consignorGST" placeholder="27AABCU9603R1ZX" />
            </div>
            <div className="space-y-3">
              <div className="section-title">Consignee (Receiver)</div>
              <div>
                <label className="label">Name <span className="text-red-400">*</span></label>
                <input className="input-field" list="consignee-list" value={form.consigneeName}
                  onChange={e => set('consigneeName', e.target.value)} placeholder="Consignee name" required />
                <datalist id="consignee-list">
                  {consigneeOptions.map(o => <option key={o.value} value={o.value} />)}
                </datalist>
              </div>
              <Field label="Address" name="consigneeAddress" placeholder="Full address" />
              <Field label="GST Number" name="consigneeGST" placeholder="07AABCU9603R1ZX" />
            </div>
          </div>

          {/* Route & Vehicle */}
          <div>
            <div className="section-title mb-3">Route & Vehicle</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">From <span className="text-red-400">*</span></label>
                <input className="input-field" list="from-list" value={form.from}
                  onChange={e => set('from', e.target.value)} placeholder="Origin city" required />
                <datalist id="from-list">{routeFromOptions.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className="label">To <span className="text-red-400">*</span></label>
                <input className="input-field" list="to-list" value={form.to}
                  onChange={e => set('to', e.target.value)} placeholder="Destination city" required />
                <datalist id="to-list">{routeToOptions.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className="label">Vehicle Number</label>
                <input className="input-field" list="vehicle-list" value={form.vehicleNumber}
                  onChange={e => set('vehicleNumber', e.target.value)} placeholder="MH-01-AB-1234" />
                <datalist id="vehicle-list">{vehicleOptions.map(o => <option key={o.value} value={o.value} />)}</datalist>
              </div>
              <Field label="Driver Name" name="driverName" placeholder="Driver name" />
            </div>
          </div>

          {/* Goods Details */}
          <div>
            <div className="section-title mb-3">Goods Description</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Description of Goods" name="description" placeholder="e.g. Electronics" required />
              <Field label="No. of Packages" name="totalPackages" type="number" placeholder="0" />
              <Field label="Actual Weight (Kg)" name="actualWeight" type="number" placeholder="0" />
              <Field label="Charged Weight (Kg)" name="chargedWeight" type="number" placeholder="0" />
            </div>
          </div>

          {/* Freight Calculation */}
          <div>
            <div className="section-title mb-3">Freight Charges</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Rate per Kg (₹)" name="freightPerUnit" type="number" placeholder="0" />
              <div>
                <label className="label">Total Freight (₹)</label>
                <input className="input-field bg-dark-600 font-bold text-brand-400"
                  value={form.totalFreight} onChange={e => set('totalFreight', e.target.value)}
                  type="number" placeholder="0" />
              </div>
              <Field label="Hamali (₹)" name="hamali" type="number" placeholder="0" />
              <Field label="Cartage (₹)" name="cartage" type="number" placeholder="0" />
              <Field label="Other Charges (₹)" name="otherCharges" type="number" placeholder="0" />
              <div>
                <label className="label">Grand Total (₹)</label>
                <input className="input-field text-green-400 font-bold text-lg"
                  value={form.grandTotal} readOnly />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="label">Remarks / Instructions</label>
            <textarea className="input-field h-16 resize-none" value={form.remarks}
              onChange={e => set('remarks', e.target.value)} placeholder="Any special instructions..." />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary px-8">
              {initial ? 'Update LR Receipt' : 'Create LR Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
