import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

export default function requestId(req: Request, res: Response, next: NextFunction){
  const id = uuidv4()
  ;(req as any).requestId = id
  res.setHeader('x-request-id', id)
  next()
}
