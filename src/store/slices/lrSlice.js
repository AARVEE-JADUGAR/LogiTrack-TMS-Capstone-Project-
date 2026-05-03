import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem('lr_receipts')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

const saveToStorage = (receipts) => {
  localStorage.setItem('lr_receipts', JSON.stringify(receipts))
}

const initialReceipts = loadFromStorage()

const lrSlice = createSlice({
  name: 'lr',
  initialState: {
    receipts: initialReceipts,
    selectedReceipt: null,
    filter: 'all',
    searchQuery: '',
  },
  reducers: {
    addReceipt: (state, action) => {
      const receipt = {
        ...action.payload,
        id: uuidv4(),
        lrNumber: `LR-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      }
      state.receipts.unshift(receipt)
      saveToStorage(state.receipts)
    },
    updateReceipt: (state, action) => {
      const idx = state.receipts.findIndex(r => r.id === action.payload.id)
      if (idx !== -1) {
        state.receipts[idx] = { ...state.receipts[idx], ...action.payload }
        saveToStorage(state.receipts)
      }
    },
    deleteReceipt: (state, action) => {
      state.receipts = state.receipts.filter(r => r.id !== action.payload)
      saveToStorage(state.receipts)
    },
    setSelectedReceipt: (state, action) => {
      state.selectedReceipt = action.payload
    },
    setFilter: (state, action) => {
      state.filter = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    updateStatus: (state, action) => {
      const { id, status } = action.payload
      const receipt = state.receipts.find(r => r.id === id)
      if (receipt) {
        receipt.status = status
        saveToStorage(state.receipts)
      }
    },
  },
})

export const {
  addReceipt, updateReceipt, deleteReceipt,
  setSelectedReceipt, setFilter, setSearchQuery, updateStatus
} = lrSlice.actions

export default lrSlice.reducer
