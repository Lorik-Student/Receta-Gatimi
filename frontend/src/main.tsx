import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary, ErrorPage } from './pages/ErrorPage'
import './style/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        {/* <ErrorBoundary fallback={<ErrorPage />}> */}
          <RouterProvider router={router}/>
        {/* </ErrorBoundary> */}
  </StrictMode>,
)
