import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem('daybook_entries')
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

const saveToStorage = (entries) => {
  localStorage.setItem('daybook_entries', JSON.stringify(entries))
}

const daybookSlice = createSlice({
  name: 'daybook',
  initialState: {
    entries: loadFromStorage(),
    filterDate: new Date().toISOString().split('T')[0],
    filterType: 'all',
  },
  reducers: {
    addEntry: (state, action) => {
      const entry = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      }
      state.entries.unshift(entry)
      saveToStorage(state.entries)
    },
    updateEntry: (state, action) => {
      const idx = state.entries.findIndex(e => e.id === action.payload.id)
      if (idx !== -1) {
        state.entries[idx] = { ...state.entries[idx], ...action.payload }
        saveToStorage(state.entries)
      }
    },
    deleteEntry: (state, action) => {
      state.entries = state.entries.filter(e => e.id !== action.payload)
      saveToStorage(state.entries)
    },
    setFilterDate: (state, action) => {
      state.filterDate = action.payload
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload
    },
  },
})

export const { addEntry, updateEntry, deleteEntry, setFilterDate, setFilterType } = daybookSlice.actions
export default daybookSlice.reducer
