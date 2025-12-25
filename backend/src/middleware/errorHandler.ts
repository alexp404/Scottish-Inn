import { Request, Response, NextFunction } from 'express'

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction){
  const status = err.status || 500
  const requestId = (req as any).requestId
  const message = status >= 500 ? 'Internal Server Error' : err.message || 'Request failed'
  const payload = { error: message, requestId }

  console.error(`[${requestId}]`, err)
  res.status(status).json(payload)
}
