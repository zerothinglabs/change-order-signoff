import { DatabaseSync } from 'node:sqlite'
import { runInNewContext } from 'node:vm'
import { readFileSync, readdirSync } from 'node:fs'
import { deflateSync, inflateSync } from 'node:zlib'

const root = new URL('../', import.meta.url)

class Stmt {
  constructor(db, sql, params = []) {
    this.db = db
    this.sql = sql
    this.params = params.map((p) => (p === undefined ? null : p))
  }
  bind(...params) {
    return new Stmt(this.db, this.sql, params)
  }
  async first(col) {
    const r = this.db.prepare(this.sql).get(...this.params)

    if (!r) return null

    return col ? r[col] : { ...r }
  }
  async all() {
    return { success: true, meta: {}, results: this.db.prepare(this.sql).all(...this.params).map((r) => ({ ...r })) }
  }
  runSync() {
    const r = this.db.prepare(this.sql).run(...this.params)

    return { success: true, meta: { changes: Number(r.changes) }, results: [] }
  }
  async run() {
    return this.runSync()
  }
}

function d1() {
  const db = new DatabaseSync(':memory:')

  for (const f of readdirSync(new URL('migrations/', root)).sort()) db.exec(readFileSync(new URL(`migrations/${f}`, root), 'utf8'))

  return {
    raw: db,
    prepare: (sql) => new Stmt(db, sql),
    async batch(stmts) {
      db.exec('BEGIN')

      try {
        const out = stmts.map((s) => s.runSync())

        db.exec('COMMIT')

        return out
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
    },
  }
}

function r2() {
  const m = new Map()

  const toBytes = async (v) =>
    typeof v === 'string' ? new TextEncoder().encode(v) : v instanceof ArrayBuffer ? new Uint8Array(v) : new Uint8Array(v)

  return {
    map: m,
    async put(key, value, opts = {}) {
      m.set(key, { bytes: await toBytes(value), httpMetadata: opts.httpMetadata ?? {} })

      return {}
    },
    async get(key) {
      const o = m.get(key)

      if (!o) return null

      return { body: o.bytes, httpMetadata: o.httpMetadata, arrayBuffer: async () => o.bytes.slice().buffer }
    },
    async delete(keys) {
      for (const k of [].concat(keys)) m.delete(k)
    },
  }
}

export function makeEnv() {
  return {
    ZT_SLUG: 'demo',
    ZT_HQ_URL: 'https://hq.test/',
    DB: d1(),
    FILES: r2(),
    ASSETS: {
      fetch: async (req) => {
        const path = new URL(req.url).pathname

        if (path.startsWith('/fonts/')) return new Response(readFileSync(new URL(`public${path}`, root)))

        return new Response(`asset ${path}`, { headers: { 'content-type': 'text/html' } })
      },
    },
  }
}

const streamData = (dict, raw) => {
  let data = Buffer.from(raw, 'latin1')

  if (/FlateDecode/.test(dict)) data = inflateSync(data)

  return data.toString('latin1')
}

export function pdfText(bytes) {
  const s = Buffer.from(bytes).toString('latin1')
  const pdfObjectsByNumber = new Map()
  const xref = s.indexOf('\n', s.indexOf('xref', Number(/startxref\s+(\d+)/.exec(s.slice(-64))[1])) + 4) + 1
  const [first, count] = s.slice(xref).split('\n', 1)[0].trim().split(' ').map(Number)
  let at = s.indexOf('\n', xref) + 1

  for (let i = 0; i < count; i++, at += 20) {
    const [off, , kind] = s.slice(at, at + 18).split(' ')

    if (kind !== 'n') continue

    const start = s.indexOf('obj', Number(off)) + 3
    const head = s.slice(start, start + 4096)
    const st = /^([\s\S]*?)stream\r?\n/.exec(head)
    const len = st && /\/Length (\d+)/.exec(st[1])

    if (len && !st[1].includes('endobj')) {
      const from = start + st[0].length

      pdfObjectsByNumber.set(String(first + i), { dict: st[1], data: s.slice(from, from + Number(len[1])) })
    } else pdfObjectsByNumber.set(String(first + i), { dict: s.slice(start, s.indexOf('endobj', start)), data: null })
  }

  const stream = (o) => (o?.data == null ? '' : streamData(o.dict, o.data))
  const hexText = (h) => Buffer.from(h, 'hex').swap16().toString('utf16le')
  const glyphTextByFontName = new Map()

  for (const { dict: body } of pdfObjectsByNumber.values()) {
    const fonts = /\/Font\s*<<([^>]*)>>/.exec(body)

    if (!fonts) continue

    for (const [, name, ref] of fonts[1].matchAll(/\/(\S+)\s+(\d+) 0 R/g)) {
      const tu = /\/ToUnicode (\d+) 0 R/.exec(pdfObjectsByNumber.get(ref)?.dict ?? '')

      if (!tu) continue

      const map = new Map()
      const cmap = stream(pdfObjectsByNumber.get(tu[1]))

      for (const [, block] of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
        for (const [, g, u] of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) map.set(g.toUpperCase(), hexText(u))
      }

      for (const [, block] of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
        for (const [, a, b, u] of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
          for (let g = parseInt(a, 16), k = 0; g <= parseInt(b, 16); g++, k++) {
            map.set(g.toString(16).toUpperCase().padStart(a.length, '0'), String.fromCodePoint(parseInt(u, 16) + k))
          }
        }
      }

      glyphTextByFontName.set(name, map)
    }
  }

  const out = []

  for (const o of pdfObjectsByNumber.values()) {
    if (/\/Font|\/ToUnicode|\/Subtype \/Image|FontFile/.test(o.dict)) continue

    let txt

    try { txt = stream(o) } catch { continue }

    let map = null
    let y = null
    let lastY = null

    for (const t of txt.matchAll(/\/(\S+) [\d.]+ Tf|(-?[\d.]+) Tm|<([0-9A-Fa-f]*)> Tj/g)) {
      if (t[1]) map = glyphTextByFontName.get(t[1]) ?? null
      else if (t[2]) y = t[2]
      else if (map) {
        const piece = t[3].toUpperCase().match(/.{4}/g)?.map((g) => map.get(g) ?? '�').join('') ?? ''

        if (y !== null && y === lastY && out.length) out[out.length - 1] += piece
        else out.push(piece)

        lastY = y
      }
    }
  }

  return out.join('\n')
}

export function readPublic(path) {
  return readFileSync(new URL(`public/${path}`, root), 'utf8')
}

export function listPublic(dir = '') {
  const out = []

  for (const e of readdirSync(new URL(`public/${dir}`, root), { withFileTypes: true })) {
    const p = dir + e.name

    if (e.isDirectory()) out.push(...listPublic(p + '/'))
    else out.push(p)
  }

  return out
}

const ONE_BIT_DEPTH = 1
const NO_ROW_FILTER = 0

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n

  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1

  return c >>> 0
})

export function blankPng(w, h) {
  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length)

    out.writeUInt32BE(data.length, 0)
    out.write(type, 4, 'latin1')
    data.copy(out, 8)
    let c = 0xffffffff

    for (const x of out.subarray(4, 8 + data.length)) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8)
    out.writeUInt32BE((c ^ 0xffffffff) >>> 0, 8 + data.length)

    return out
  }

  const ihdr = Buffer.alloc(13)

  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = ONE_BIT_DEPTH
  const row = 1 + Math.ceil(w / 8)
  const raw = Buffer.alloc(row * h, 0xff)

  for (let y = 0; y < h; y++) raw[y * row] = NO_ROW_FILTER
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  return new Uint8Array(Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
}

export function runScript(source, sandbox) {
  runInNewContext(source, sandbox)
}
