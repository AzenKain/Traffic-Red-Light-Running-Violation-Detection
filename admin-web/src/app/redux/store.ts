import { configureStore } from '@reduxjs/toolkit'
import ProductRedux from './features/product/product.redux'
import UserRedux from './features/user/user.redux'

export const makeStore = () => {
  return configureStore({
    reducer: {
      ProductRedux,
      UserRedux,
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']