import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GlobusContextProvider } from '@openglobus/openglobus-react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobusContextProvider>
      <App />
    </GlobusContextProvider>
  </React.StrictMode>,
)
