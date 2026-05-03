import { createSlice } from '@reduxjs/toolkit'

const defaultSettings = {
  company: {
    name: 'LogiTrack Transport Co.',
    address: '123, Transport Nagar, Mumbai - 400001',
    phone: '022-12345678',
    mobile: '9876543210',
    email: 'info@logitrack.in',
    gst: '27AABCL1234M1ZX',
    pan: 'AABCL1234M',
    logo: '',
  },
  lr: {
    prefix: 'LR',
    startNumber: 1001,
    termsAndConditions: '1. Goods once booked will not be returned.\n2. Company not responsible for leakage, breakage or damages.\n3. Claims must be filed within 7 days of delivery.\n4. Subject to Mumbai jurisdiction only.',
    defaultPaymentMode: 'to-pay',
  },
  routes: [
    { id: '1', from: 'Mumbai', to: 'Delhi', baseRate: 5000 },
    { id: '2', from: 'Mumbai', to: 'Ahmedabad', baseRate: 2000 },
    { id: '3', from: 'Delhi', to: 'Kolkata', baseRate: 4500 },
    { id: '4', from: 'Mumbai', to: 'Pune', baseRate: 800 },
    { id: '5', from: 'Bangalore', to: 'Chennai', baseRate: 1200 },
  ],
  vehicles: [
    { id: '1', number: 'MH-01-AB-1234', type: 'Truck 10T', driver: 'Ramesh', driverPhone: '9876500001' },
    { id: '2', number: 'MH-02-CD-5678', type: 'Truck 20T', driver: 'Suresh', driverPhone: '9876500002' },
    { id: '3', number: 'DL-01-EF-9012', type: 'Mini Truck', driver: 'Mahesh', driverPhone: '9876500003' },
  ],
  theme: {
    primaryColor: '#ea580c',
    invoiceHeader: 'LORRY RECEIPT',
  },
}

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('tms_settings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  } catch { return defaultSettings }
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSettings(),
  reducers: {
    updateCompany: (state, action) => {
      state.company = { ...state.company, ...action.payload }
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
    updateLRSettings: (state, action) => {
      state.lr = { ...state.lr, ...action.payload }
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
    addRoute: (state, action) => {
      state.routes.push({ ...action.payload, id: Date.now().toString() })
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
    updateRoute: (state, action) => {
      const idx = state.routes.findIndex(r => r.id === action.payload.id)
      if (idx !== -1) state.routes[idx] = action.payload
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
    deleteRoute: (state, action) => {
      state.routes = state.routes.filter(r => r.id !== action.payload)
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
    addVehicle: (state, action) => {
      state.vehicles.push({ ...action.payload, id: Date.now().toString() })
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
    updateVehicle: (state, action) => {
      const idx = state.vehicles.findIndex(v => v.id === action.payload.id)
      if (idx !== -1) state.vehicles[idx] = action.payload
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
    deleteVehicle: (state, action) => {
      state.vehicles = state.vehicles.filter(v => v.id !== action.payload)
      localStorage.setItem('tms_settings', JSON.stringify(state))
    },
  },
})

export const {
  updateCompany, updateLRSettings, addRoute, updateRoute, deleteRoute,
  addVehicle, updateVehicle, deleteVehicle
} = settingsSlice.actions

export default settingsSlice.reducer
