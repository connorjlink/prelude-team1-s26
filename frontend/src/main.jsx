import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import searchReducer from './store/searchSlice'

const store = configureStore({ reducer: { search: searchReducer } })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}><App /></Provider>
  </StrictMode>,
)
