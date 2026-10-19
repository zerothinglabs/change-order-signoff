import type { Bindings } from './types'

export const hqUrl = (env: Bindings) => env.ZT_HQ_URL.replace(/\/+$/, '')
