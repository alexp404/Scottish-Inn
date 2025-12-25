import { useEffect } from 'react'
import { useToasts } from '../../context/ToastContext'

export default function GlobalErrorCatcher(){
  const { push } = useToasts()

  useEffect(()=>{
    function onError(ev: ErrorEvent){
      push({ type: 'error', message: ev.error?.message || ev.message || 'Unexpected error occurred' })
    }
    function onRejection(ev: PromiseRejectionEvent){
      const msg = (ev.reason && (ev.reason.message || String(ev.reason))) || 'Unexpected error occurred'
      push({ type: 'error', message: msg })
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return ()=>{
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  },[push])
  return null
}
