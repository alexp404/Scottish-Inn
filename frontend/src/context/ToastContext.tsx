import React, { createContext, useContext, useState, ReactNode } from 'react'

type Toast = { id: string; type?: 'success'|'error'|'info'; message: string }

const ToastContext = createContext<any>(null)

export function ToastProvider({ children }:{ children: ReactNode }){
  const [toasts, setToasts] = useState<Toast[]>([])

  function push(toast: Omit<Toast,'id'>){
    const id = Math.random().toString(36).slice(2,9)
    setToasts(t => [...t, { id, ...toast }])
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  function remove(id:string){ setToasts(t => t.filter(x => x.id !== id)) }

  return (
    <ToastContext.Provider value={{ push, remove, toasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToasts(){ return useContext(ToastContext) }
