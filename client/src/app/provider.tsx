import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/react-query'
import { Toaster } from 'sonner'

interface AppProviderProps {
  children: React.ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </Router>
    </QueryClientProvider>
  )
}
