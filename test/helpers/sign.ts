import { call } from './call'

export const sign = (t: string, body: Record<string, unknown>) =>
  call(`/api/sign/${t}`, { body, headers: { 'cf-connecting-ip': '203.0.113.7', 'user-agent': 'TestPhone/1.0' } })
