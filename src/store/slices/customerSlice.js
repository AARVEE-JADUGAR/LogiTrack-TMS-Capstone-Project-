import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const sampleCustomers = [
  { id: uuidv4(), name: 'Rajesh Traders', contact: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@traders.com', city: 'Mumbai', gst: '27AABCU9603R1ZX', type: 'consignor', status: 'active', totalShipments: 24, outstanding: 45000, createdAt: '2024-01-15T10:00:00Z' },
  { id: uuidv4(), name: 'Sharma Enterprises', contact: 'Amit Sharma', phone: '9845001234', email: 'amit@sharma.com', city: 'Delhi', gst: '07AABCU9603R1ZX', type: 'consignee', status: 'active', totalShipments: 18, outstanding: 12000, createdAt: '2024-02-01T10:00:00Z' },
  { id: uuidv4(), name: 'Gupta Logistics', contact: 'Suresh Gupta', phone: '9700123456', email: 'suresh@gupta.com', city: 'Ahmedabad', gst: '24AABCU9603R1ZX', type: 'both', status: 'active', totalShipments: 35, outstanding: 0, createdAt: '2024-01-20T10:00:00Z' },
  { id: uuidv4(), name: 'Patel Industries', contact: 'Nikhil Patel', phone: '9988776655', email: 'nikhil@patel.com', city: 'Surat', gst: '24AADCP1234M1ZX', type: 'consignor', status: 'inactive', totalShipments: 8, outstanding: 7500, createdAt: '2024-03-10T10:00:00Z' },
]

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem('customers')
    return data ? JSON.parse(data) : sampleCustomers
  } catch { return sampleCustomers }
}

const saveToStorage = (customers) => {
  localStorage.setItem('customers', JSON.stringify(customers))
}

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    list: loadFromStorage(),
    searchQuery: '',
    filterType: 'all',
    filterStatus: 'all',
  },
  reducers: {
    addCustomer: (state, action) => {
      const customer = {
        ...action.payload,
        id: uuidv4(),
        totalShipments: 0,
        outstanding: 0,
        createdAt: new Date().toISOString(),
      }
      state.list.unshift(customer)
      saveToStorage(state.list)
    },
    updateCustomer: (state, action) => {
      const idx = state.list.findIndex(c => c.id === action.payload.id)
      if (idx !== -1) {
        state.list[idx] = { ...state.list[idx], ...action.payload }
        saveToStorage(state.list)
      }
    },
    deleteCustomer: (state, action) => {
      state.list = state.list.filter(c => c.id !== action.payload)
      saveToStorage(state.list)
    },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload },
    setFilterType: (state, action) => { state.filterType = action.payload },
    setFilterStatus: (state, action) => { state.filterStatus = action.payload },
  },
})

export const { addCustomer, updateCustomer, deleteCustomer, setSearchQuery, setFilterType, setFilterStatus } = customerSlice.actions
export default customerSlice.reducer
