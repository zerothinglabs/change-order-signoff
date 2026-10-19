import { Hono } from 'hono'
import { config } from './api/config'
import { health } from './api/health'
import { proExample } from './api/pro-example'
import { ztBuy } from './api/zt-buy'
import { ztEvent } from './api/zt-event'
import { ztInternal } from './api/zt-internal'
import { posthog } from './first-party-proxy/posthog'
import { product } from './product'
import type { Env } from './types'

const app = new Hono<Env>()

app.get('/zt/internal', ztInternal)
app.get('/api/config', config)
app.post('/zt/e', ztEvent)
app.get('/zt/buy', ztBuy)
app.all('/zt/ph/*', posthog)
app.get('/api/health', health)
app.get('/api/pro/example', proExample)
app.route('/', product)

export default app
