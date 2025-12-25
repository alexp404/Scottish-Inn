import { Request, Response } from 'express'
import { deviceStates, channelsByDevice } from '../data/store'

function buildResponse(success: boolean, payload: any = {}){
  return { success, ...payload }
}

export async function powerControl(req: Request, res: Response){
  const { deviceId } = req.body
  const { action } = req.params // 'on' or 'off'

  if (!deviceId) return res.status(400).json(buildResponse(false, { error: 'deviceId required' }))

  const state = deviceStates[deviceId] || { power: false, volume: 0 }
  state.power = action === 'on'
  state.timestamp = Date.now()

  deviceStates[deviceId] = state

  return res.json(buildResponse(true, { commandId: `cmd_${Date.now()}`, state }))
}

export async function setVolume(req: Request, res: Response){
  const { deviceId, parameters } = req.body
  const level = parameters?.volumeLevel

  if (!deviceId || typeof level !== 'number') return res.status(400).json(buildResponse(false, { error: 'deviceId and volumeLevel required' }))

  const state = deviceStates[deviceId] || { power: false, volume: 0 }
  state.volume = Math.max(0, Math.min(100, level))
  state.timestamp = Date.now()

  deviceStates[deviceId] = state

  return res.json(buildResponse(true, { commandId: `cmd_${Date.now()}`, state }))
}

export async function selectChannel(req: Request, res: Response){
  const { deviceId, parameters } = req.body
  const channelNumber = parameters?.channelNumber

  const channels = channelsByDevice[deviceId] || []
  const exists = channels.some((c:any) => c.channelNumber === channelNumber)

  if (!exists) return res.status(400).json(buildResponse(false, { error: `Channel ${channelNumber} not available` }))

  const state = deviceStates[deviceId] || { power: false, volume: 0 }
  state.channel = channelNumber
  state.channelName = channels.find((c:any)=>c.channelNumber===channelNumber).channelName
  state.timestamp = Date.now()

  deviceStates[deviceId] = state

  return res.json(buildResponse(true, { state }))
}

export async function navigate(req: Request, res: Response){
  const { deviceId } = req.body
  const { direction } = req.params

  if (!deviceId) return res.status(400).json(buildResponse(false, { error: 'deviceId required' }))

  // navigation doesn't change device state in this mock
  return res.json(buildResponse(true, { cursorPosition: { x: 100, y: 50 } }))
}

export async function sendText(req: Request, res: Response){
  const { deviceId, parameters } = req.body
  const text = parameters?.text

  if (!deviceId || typeof text !== 'string') return res.status(400).json(buildResponse(false, { error: 'deviceId and text required' }))

  if (text.length > 200) return res.status(400).json(buildResponse(false, { error: 'Text input limited to 200 characters' }))

  // log and return success
  return res.json(buildResponse(true, { commandId: `cmd_${Date.now()}` }))
}

export async function getDeviceStatus(req: Request, res: Response){
  const deviceId = req.query.deviceId as string
  if (!deviceId) return res.status(400).json(buildResponse(false, { error: 'deviceId query required' }))

  const state = deviceStates[deviceId]
  if (!state) return res.json(buildResponse(false, { state: { power: false, volume: 0, channel: 0 }, timestamp: Date.now() } ))

  return res.json(buildResponse(true, { state, timestamp: Date.now() }))
}

export async function getChannelList(req: Request, res: Response){
  const deviceId = req.query.deviceId as string
  if (!deviceId) return res.status(400).json(buildResponse(false, { error: 'deviceId query required' }))

  const channels = channelsByDevice[deviceId] || []
  return res.json({ channels })
}
