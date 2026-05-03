import { configureStore } from '@reduxjs/toolkit'
import lrReducer from './slices/lrSlice'
import daybookReducer from './slices/daybookSlice'
import customerReducer from './slices/customerSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    lr: lrReducer,
    daybook: daybookReducer,
    customers: customerReducer,
    settings: settingsReducer,
  },
})
