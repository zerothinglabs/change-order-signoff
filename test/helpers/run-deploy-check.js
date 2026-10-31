import { execFile } from 'node:child_process'
import { createServer } from 'node:http'

const script = new URL('../../scripts/check-deploy.sh', import.meta.url).pathname

export async function runDeployCheck(status, body) {
  const requests = []

  const server = createServer((req, res) => {
    requests.push({ method: req.method, url: req.url, cookie: req.headers.cookie })
    res.writeHead(req.url === '/api/workspace' ? status : 404).end(body)
  })

  await new Promise((done) => server.listen(0, '127.0.0.1', done))

  const base = `http://127.0.0.1:${server.address().port}/`

  const result = await new Promise((done) => {
    execFile('sh', [script, base], (error, stdout, stderr) => done({ code: error?.code ?? 0, stdout, stderr }))
  })

  server.close()

  return { ...result, requests }
}
