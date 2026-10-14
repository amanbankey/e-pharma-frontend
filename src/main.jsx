import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './lib/CartContext.jsx'
import { AuthProvider } from './lib/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
            <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={10}
            toastOptions={{
              duration: 4000,
              style: {
                maxWidth: '440px',
                padding: '14px 16px',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                borderRadius: '14px',
                color: '#0f2a26',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              },
              success: {
                duration: 3500,
                style: { background: '#ecfdf5', border: '1px solid #a7f3d0' },
              },
              error: {
                duration: 6000,
                style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
