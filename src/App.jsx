import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import LRReceiptPage from './pages/LRReceipt/LRReceiptPage'
import DaybookPage from './pages/Daybook/DaybookPage'
import CustomersPage from './pages/Customers/CustomersPage'
import SettingsPage from './pages/Settings/SettingsPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lr-receipt" element={<LRReceiptPage />} />
        <Route path="/daybook" element={<DaybookPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}
