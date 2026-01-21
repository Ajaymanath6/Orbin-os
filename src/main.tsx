import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// On Vercel the app is served from the domain root,
// so we don't use a basename here. The previous '/shopos'
// basename was only needed for GitHub Pages and breaks
// routing in production on Vercel.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
