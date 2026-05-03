import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import { format, parseISO } from 'date-fns'
import { useReactToPrint } from 'react-to-print'

export default function LRPrintView({ lr, onClose }) {
  const printRef = useRef()
  const company = useSelector(s => s.settings.company)
  const lrSettings = useSelector(s => s.settings.lr)

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${lr.lrNumber}`,
  })

  const Row = ({ label, value }) => (
    <div className="flex" style={{ borderBottom: '1px solid #ddd', minHeight: 28 }}>
      <div style={{ width: '35%', padding: '4px 8px', background: '#f5f5f5', fontWeight: '600', fontSize: 11, borderRight: '1px solid #ddd' }}>{label}</div>
      <div style={{ flex: 1, padding: '4px 8px', fontSize: 12 }}>{value || '—'}</div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="text-sm font-semibold text-white/70">Print Preview — {lr.lrNumber}</div>
          <div className="flex gap-3">
            <button className="btn-primary flex items-center gap-2" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <polyline points="6,9 6,2 18,2 18,9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print / Download PDF
            </button>
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-200">
          <div ref={printRef} style={{ background: 'white', color: '#111', fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto', padding: 24 }}>
            {/* Company Header */}
            <div style={{ borderBottom: '3px solid #ea580c', paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#c2410c', letterSpacing: 2 }}>{company.name}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{company.address}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>
                    Ph: {company.phone} | Mob: {company.mobile} | Email: {company.email}
                  </div>
                  <div style={{ fontSize: 11, color: '#555' }}>GST: {company.gst} | PAN: {company.pan}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: '#ea580c', color: 'white', padding: '8px 18px', fontSize: 18, fontWeight: 900, letterSpacing: 3 }}>
                    LORRY RECEIPT
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: '#c2410c' }}>{lr.lrNumber}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>
                    Date: {lr.date ? format(new Date(lr.date), 'dd/MM/yyyy') : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Consignor / Consignee */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ border: '1px solid #ddd', borderRadius: 4 }}>
                <div style={{ background: '#ea580c', color: 'white', padding: '4px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CONSIGNOR (SENDER)</div>
                <div style={{ padding: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{lr.consignorName}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{lr.consignorAddress}</div>
                  {lr.consignorGST && <div style={{ fontSize: 10, color: '#777', marginTop: 4 }}>GST: {lr.consignorGST}</div>}
                </div>
              </div>
              <div style={{ border: '1px solid #ddd', borderRadius: 4 }}>
                <div style={{ background: '#1d4ed8', color: 'white', padding: '4px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CONSIGNEE (RECEIVER)</div>
                <div style={{ padding: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{lr.consigneeName}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{lr.consigneeAddress}</div>
                  {lr.consigneeGST && <div style={{ fontSize: 10, color: '#777', marginTop: 4 }}>GST: {lr.consigneeGST}</div>}
                </div>
              </div>
            </div>

            {/* Route Info */}
            <div style={{ border: '1px solid #ddd', borderRadius: 4, marginBottom: 12 }}>
              <div style={{ background: '#374151', color: 'white', padding: '4px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ROUTE & VEHICLE DETAILS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderTop: '1px solid #ddd' }}>
                {[
                  ['FROM', lr.from], ['TO', lr.to],
                  ['VEHICLE NO.', lr.vehicleNumber], ['DRIVER', lr.driverName],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: '6px 10px', borderRight: '1px solid #ddd' }}>
                    <div style={{ fontSize: 9, color: '#888', fontWeight: 700, letterSpacing: 1 }}>{l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goods Table */}
            <div style={{ border: '1px solid #ddd', borderRadius: 4, marginBottom: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#374151', color: 'white' }}>
                    {['Description of Goods', 'Packages', 'Actual Wt (Kg)', 'Charged Wt (Kg)', 'Rate/Kg (₹)', 'Freight (₹)'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', fontSize: 10, fontWeight: 700, textAlign: 'left', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', fontSize: 12, borderBottom: '1px solid #eee' }}>{lr.description}</td>
                    <td style={{ padding: '8px', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #eee' }}>{lr.totalPackages}</td>
                    <td style={{ padding: '8px', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #eee' }}>{lr.actualWeight}</td>
                    <td style={{ padding: '8px', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #eee' }}>{lr.chargedWeight}</td>
                    <td style={{ padding: '8px', fontSize: 12, textAlign: 'center', borderBottom: '1px solid #eee' }}>{lr.freightPerUnit}</td>
                    <td style={{ padding: '8px', fontSize: 12, fontWeight: 700, borderBottom: '1px solid #eee' }}>₹{parseFloat(lr.totalFreight || 0).toLocaleString()}</td>
                  </tr>
                  <tr style={{ background: '#f9f9f9' }}>
                    <td colSpan={5} style={{ padding: '5px 8px', fontSize: 10, color: '#555' }}>
                      Invoice No.: {lr.invoiceNumber || '—'} &nbsp;|&nbsp; E-Way Bill: {lr.eWayBill || '—'} &nbsp;|&nbsp;
                      Payment: <strong>{lr.paymentMode === 'to-pay' ? 'TO PAY' : lr.paymentMode === 'paid' ? 'PAID' : 'TBB'}</strong>
                    </td>
                    <td style={{ padding: '5px 8px' }}>
                      <div style={{ fontSize: 10, color: '#555' }}>Hamali: ₹{lr.hamali || 0}</div>
                      <div style={{ fontSize: 10, color: '#555' }}>Cartage: ₹{lr.cartage || 0}</div>
                      <div style={{ fontSize: 10, color: '#555' }}>Other: ₹{lr.otherCharges || 0}</div>
                    </td>
                  </tr>
                  <tr style={{ background: '#ea580c', color: 'white' }}>
                    <td colSpan={5} style={{ padding: '8px', fontSize: 13, fontWeight: 900, letterSpacing: 1 }}>GRAND TOTAL</td>
                    <td style={{ padding: '8px', fontSize: 15, fontWeight: 900 }}>₹{parseFloat(lr.grandTotal || lr.totalFreight || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 4 }}>TERMS & CONDITIONS</div>
                <div style={{ fontSize: 9.5, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {lrSettings.termsAndConditions}
                </div>
                {lr.remarks && (
                  <div style={{ marginTop: 6, fontSize: 10, fontWeight: 600, color: '#333' }}>
                    Remarks: {lr.remarks}
                  </div>
                )}
              </div>
              <div>
                <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1 }}>CONSIGNOR'S SIGNATURE</div>
                  <div style={{ height: 50 }} />
                  <div style={{ borderTop: '1px solid #ddd', paddingTop: 4, fontSize: 10, color: '#888' }}>{lr.consignorName}</div>
                </div>
                <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 8 }}>
                  <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1 }}>FOR {company.name.toUpperCase()}</div>
                  <div style={{ height: 50 }} />
                  <div style={{ borderTop: '1px solid #ddd', paddingTop: 4, fontSize: 10, color: '#888' }}>Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
