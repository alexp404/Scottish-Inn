import { useEffect, useState } from 'react'
import { fetchRooms } from '../services/api'
import { Room } from '../types'

export default function useRooms(){
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      setLoading(true)
      try{
        const data = await fetchRooms()
        if (mounted) setRooms(data)
      }catch(err:any){
        if (mounted) setError(err)
      }finally{
        if (mounted) setLoading(false)
      }
    }
    load()
    return ()=>{ mounted = false }
  },[])

  return { rooms, loading, error }
}
