import { Router } from 'express'
import * as ctrl from '../controllers/firetvController'

const router = Router()

// Power control: POST /remote/api/power/:action (on|off)
router.post('/remote/api/power/:action', ctrl.powerControl)

// Volume set: POST /remote/api/volume/set
router.post('/remote/api/volume/set', ctrl.setVolume)

// Channel set: POST /remote/api/channel/set
router.post('/remote/api/channel/set', ctrl.selectChannel)

// Navigation: POST /remote/api/navigate/:direction
router.post('/remote/api/navigate/:direction', ctrl.navigate)

// Text input: POST /remote/api/input/text
router.post('/remote/api/input/text', ctrl.sendText)

// Get status: GET /remote/api/status?deviceId=
router.get('/remote/api/status', ctrl.getDeviceStatus)

// Get channels: GET /remote/api/channels?deviceId=
router.get('/remote/api/channels', ctrl.getChannelList)

export default router
