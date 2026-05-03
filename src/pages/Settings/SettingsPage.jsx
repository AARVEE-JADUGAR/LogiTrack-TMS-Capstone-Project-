import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  updateCompany, updateLRSettings,
  addRoute, updateRoute, deleteRoute,
  addVehicle, updateVehicle, deleteVehicle
} from '../../store/slices/settingsSlice'

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
      active ? 'border-brand-500 text-brand-400' : 'border-transparent text-white/30 hover:text-white'
    }`}
  >
    {label}
  </button>
)

export default function SettingsPage() {
  const dispatch = useDispatch()
  const settings = useSelector(s => s.settings)
  const [tab, setTab] = useState('company')
  const [saved, setSaved] = useState(false)

  const [companyForm, setCompanyForm] = useState({ ...settings.company })
  const [lrForm, setLrForm] = useState({ ...settings.lr })

  const [newRoute, setNewRoute] = useState({ from: '', to: '', baseRate: '' })
  const [newVehicle, setNewVehicle] = useState({ number: '', type: '', driver: '', driverPhone: '' })
  const [editRoute, setEditRoute] = useState(null)
  const [editVehicle, setEditVehicle] = useState(null)

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveCompany = () => {
    dispatch(updateCompany(companyForm))
    showSaved()
  }

  const saveLR = () => {
    dispatch(updateLRSettings(lrForm))
    showSaved()
  }

  const Field = ({ label, name, form, setForm, type = 'text', placeholder = '' }) => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={form[name] || ''}
        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
      />
    </div>
  )

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-title">Configuration</div>
          <div className="page-title">SETTINGS</div>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-semibold animate-fade-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            Saved successfully
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="flex border-b border-white/5">
          {[
            { key: 'company', label: 'Company' },
            { key: 'lr', label: 'LR Settings' },
            { key: 'routes', label: 'Routes' },
            { key: 'vehicles', label: 'Vehicles' },
          ].map(t => <Tab key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />)}
        </div>

        <div className="p-6">
          {/* Company Settings */}
          {tab === 'company' && (
            <div className="space-y-6">
              <div className="section-title">Company Information</div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Company Name" name="name" form={companyForm} setForm={setCompanyForm} placeholder="Your Transport Co." />
                <Field label="GST Number" name="gst" form={companyForm} setForm={setCompanyForm} placeholder="27AABCL1234M1ZX" />
                <Field label="PAN Number" name="pan" form={companyForm} setForm={setCompanyForm} placeholder="AABCL1234M" />
                <Field label="Email" name="email" form={companyForm} setForm={setCompanyForm} type="email" placeholder="info@company.com" />
                <Field label="Phone" name="phone" form={companyForm} setForm={setCompanyForm} placeholder="022-12345678" />
                <Field label="Mobile" name="mobile" form={companyForm} setForm={setCompanyForm} placeholder="9876543210" />
              </div>
              <div>
                <label className="label">Full Address</label>
                <textarea
                  className="input-field h-20 resize-none"
                  value={companyForm.address || ''}
                  onChange={e => setCompanyForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="Complete company address..."
                />
              </div>
              <button className="btn-primary px-8" onClick={saveCompany}>Save Company Settings</button>
            </div>
          )}

          {/* LR Settings */}
          {tab === 'lr' && (
            <div className="space-y-6">
              <div className="section-title">LR Receipt Configuration</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">LR Number Prefix</label>
                  <input className="input-field" value={lrForm.prefix || ''} onChange={e => setLrForm(p => ({ ...p, prefix: e.target.value }))} placeholder="LR" />
                </div>
                <div>
                  <label className="label">Starting Number</label>
                  <input className="input-field" type="number" value={lrForm.startNumber || ''} onChange={e => setLrForm(p => ({ ...p, startNumber: parseInt(e.target.value) }))} placeholder="1001" />
                </div>
                <div>
                  <label className="label">Default Payment Mode</label>
                  <select className="input-field" value={lrForm.defaultPaymentMode || 'to-pay'} onChange={e => setLrForm(p => ({ ...p, defaultPaymentMode: e.target.value }))}>
                    <option value="to-pay">To Pay</option>
                    <option value="paid">Paid</option>
                    <option value="tbb">TBB</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Terms & Conditions (printed on LR)</label>
                <textarea
                  className="input-field h-32 resize-none font-mono text-xs"
                  value={lrForm.termsAndConditions || ''}
                  onChange={e => setLrForm(p => ({ ...p, termsAndConditions: e.target.value }))}
                />
              </div>
              <button className="btn-primary px-8" onClick={saveLR}>Save LR Settings</button>
            </div>
          )}

          {/* Routes */}
          {tab === 'routes' && (
            <div className="space-y-4">
              <div className="section-title">Manage Routes</div>
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="table-head">From</th>
                      <th className="table-head">To</th>
                      <th className="table-head">Base Rate (₹)</th>
                      <th className="table-head">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.routes.map(r => (
                      <tr key={r.id} className="hover:bg-white/2 group">
                        {editRoute?.id === r.id ? (
                          <>
                            <td className="table-cell"><input className="input-field text-xs" value={editRoute.from} onChange={e => setEditRoute(p => ({ ...p, from: e.target.value }))} /></td>
                            <td className="table-cell"><input className="input-field text-xs" value={editRoute.to} onChange={e => setEditRoute(p => ({ ...p, to: e.target.value }))} /></td>
                            <td className="table-cell"><input className="input-field text-xs" type="number" value={editRoute.baseRate} onChange={e => setEditRoute(p => ({ ...p, baseRate: e.target.value }))} /></td>
                            <td className="table-cell">
                              <div className="flex gap-2">
                                <button className="btn-primary text-xs py-1" onClick={() => { dispatch(updateRoute(editRoute)); setEditRoute(null) }}>Save</button>
                                <button className="btn-secondary text-xs py-1" onClick={() => setEditRoute(null)}>Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="table-cell">{r.from}</td>
                            <td className="table-cell text-white/60">{r.to}</td>
                            <td className="table-cell font-mono text-brand-400">₹{parseFloat(r.baseRate).toLocaleString()}</td>
                            <td className="table-cell">
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="btn-secondary text-xs py-1" onClick={() => setEditRoute({ ...r })}>Edit</button>
                                <button className="btn-danger text-xs py-1" onClick={() => dispatch(deleteRoute(r.id))}>Del</button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Add Route */}
              <div className="glass-card p-4">
                <div className="section-title mb-3">Add New Route</div>
                <div className="grid grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="label">From</label>
                    <input className="input-field" value={newRoute.from} onChange={e => setNewRoute(p => ({ ...p, from: e.target.value }))} placeholder="Origin city" />
                  </div>
                  <div>
                    <label className="label">To</label>
                    <input className="input-field" value={newRoute.to} onChange={e => setNewRoute(p => ({ ...p, to: e.target.value }))} placeholder="Destination city" />
                  </div>
                  <div>
                    <label className="label">Base Rate (₹)</label>
                    <input className="input-field" type="number" value={newRoute.baseRate} onChange={e => setNewRoute(p => ({ ...p, baseRate: e.target.value }))} placeholder="0" />
                  </div>
                  <button className="btn-primary" onClick={() => {
                    if (newRoute.from && newRoute.to) {
                      dispatch(addRoute(newRoute))
                      setNewRoute({ from: '', to: '', baseRate: '' })
                    }
                  }}>Add Route</button>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles */}
          {tab === 'vehicles' && (
            <div className="space-y-4">
              <div className="section-title">Manage Fleet</div>
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="table-head">Vehicle Number</th>
                      <th className="table-head">Type</th>
                      <th className="table-head">Driver</th>
                      <th className="table-head">Driver Phone</th>
                      <th className="table-head">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-white/2 group">
                        {editVehicle?.id === v.id ? (
                          <>
                            <td className="table-cell"><input className="input-field text-xs font-mono" value={editVehicle.number} onChange={e => setEditVehicle(p => ({ ...p, number: e.target.value }))} /></td>
                            <td className="table-cell"><input className="input-field text-xs" value={editVehicle.type} onChange={e => setEditVehicle(p => ({ ...p, type: e.target.value }))} /></td>
                            <td className="table-cell"><input className="input-field text-xs" value={editVehicle.driver} onChange={e => setEditVehicle(p => ({ ...p, driver: e.target.value }))} /></td>
                            <td className="table-cell"><input className="input-field text-xs font-mono" value={editVehicle.driverPhone} onChange={e => setEditVehicle(p => ({ ...p, driverPhone: e.target.value }))} /></td>
                            <td className="table-cell">
                              <div className="flex gap-2">
                                <button className="btn-primary text-xs py-1" onClick={() => { dispatch(updateVehicle(editVehicle)); setEditVehicle(null) }}>Save</button>
                                <button className="btn-secondary text-xs py-1" onClick={() => setEditVehicle(null)}>Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="table-cell font-mono text-brand-400 text-xs">{v.number}</td>
                            <td className="table-cell text-white/60">{v.type}</td>
                            <td className="table-cell">{v.driver}</td>
                            <td className="table-cell font-mono text-xs text-white/50">{v.driverPhone}</td>
                            <td className="table-cell">
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="btn-secondary text-xs py-1" onClick={() => setEditVehicle({ ...v })}>Edit</button>
                                <button className="btn-danger text-xs py-1" onClick={() => dispatch(deleteVehicle(v.id))}>Del</button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Add Vehicle */}
              <div className="glass-card p-4">
                <div className="section-title mb-3">Add New Vehicle</div>
                <div className="grid grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="label">Vehicle Number</label>
                    <input className="input-field font-mono text-xs" value={newVehicle.number} onChange={e => setNewVehicle(p => ({ ...p, number: e.target.value }))} placeholder="MH-01-AB-1234" />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <input className="input-field text-xs" value={newVehicle.type} onChange={e => setNewVehicle(p => ({ ...p, type: e.target.value }))} placeholder="Truck 10T" />
                  </div>
                  <div>
                    <label className="label">Driver Name</label>
                    <input className="input-field text-xs" value={newVehicle.driver} onChange={e => setNewVehicle(p => ({ ...p, driver: e.target.value }))} placeholder="Driver name" />
                  </div>
                  <div>
                    <label className="label">Driver Phone</label>
                    <input className="input-field font-mono text-xs" value={newVehicle.driverPhone} onChange={e => setNewVehicle(p => ({ ...p, driverPhone: e.target.value }))} placeholder="9876543210" />
                  </div>
                  <button className="btn-primary" onClick={() => {
                    if (newVehicle.number) {
                      dispatch(addVehicle(newVehicle))
                      setNewVehicle({ number: '', type: '', driver: '', driverPhone: '' })
                    }
                  }}>Add Vehicle</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
