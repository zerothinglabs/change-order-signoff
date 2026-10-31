export function runDeployCheck(status: number, body: string): Promise<{
  code: number
  stdout: string
  stderr: string
  requests: { method: string; url: string; cookie: string }[]
}>
