import { call } from './call'

export const send = (token: string, id: string) => call(`/api/co/${id}/send`, { token, method: 'POST' })
