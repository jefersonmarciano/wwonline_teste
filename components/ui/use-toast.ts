"use client"

import { useState, useEffect, useCallback } from "react"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
}

const TOAST_TIMEOUT = 5000

type ToastState = {
  toasts: ToastProps[]
}

function useToastStore() {
  const [state, setState] = useState<ToastState>({
    toasts: [],
  })

  const toast = useCallback(
    (props: Omit<ToastProps, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      
      setState((prevState) => ({
        toasts: [...prevState.toasts, { id, ...props }],
      }))

      return id
    },
    []
  )

  const dismiss = useCallback((toastId?: string) => {
    setState((prevState) => ({
      toasts: prevState.toasts.filter((toast) => {
        if (toastId === undefined) return false
        return toast.id !== toastId
      }),
    }))
  }, [])

  const dismissAll = useCallback(() => {
    setState({ toasts: [] })
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    dismissAll,
  }
}

// Criar um store que funcione tanto no cliente quanto no servidor
const createStore = () => {
  return {
    toasts: [],
    toast: (props: Omit<ToastProps, 'id'>) => "",
    dismiss: (id?: string) => {},
    dismissAll: () => {}
  }
}

// Usar um objeto vazio para o servidor
let store: ReturnType<typeof useToastStore> | ReturnType<typeof createStore> = createStore()

// Função que obtém o store no cliente ou retorna o store vazio no servidor
function getStore() {
  if (typeof window !== 'undefined') {
    if (!('toast' in store)) {
      store = useToastStore()
    }
    return store
  }
  return createStore()
}

export function toast(props: Omit<ToastProps, 'id'>) {
  const store = getStore()
  return store.toast(props)
}

export function useToast() {
  const [, forceRender] = useState({})
  
  useEffect(() => {
    // Este efeito força a renderização sempre que o estado do toast mudar
    const interval = setInterval(() => forceRender({}), 100)
    return () => clearInterval(interval)
  }, [])
  
  const store = getStore()
  
  useEffect(() => {
    // Auto dismiss toasts after timeout
    const timeouts: NodeJS.Timeout[] = []
    
    if (store.toasts && Array.isArray(store.toasts)) {
      store.toasts.forEach((toast) => {
        const timeout = setTimeout(() => {
          store.dismiss(toast.id)
        }, TOAST_TIMEOUT)
        
        timeouts.push(timeout)
      })
    }
    
    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [store.toasts])
  
  return {
    toasts: store.toasts || [],
    toast: store.toast,
    dismiss: store.dismiss,
    dismissAll: store.dismissAll,
  }
}
