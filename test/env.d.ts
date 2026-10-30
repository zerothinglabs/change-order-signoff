export function makeEnv(): {
  ZT_SLUG: string
  ZT_HQ_URL: string
  DB: D1Database & { raw: { prepare(sql: string): { get(...p: unknown[]): Record<string, string>; all(...p: unknown[]): Record<string, string>[]; run(...p: unknown[]): unknown } } }
  FILES: R2Bucket & { map: Map<string, { bytes: Uint8Array; httpMetadata: { contentType?: string } }> }
  ASSETS: Fetcher
}
export function pdfText(bytes: Uint8Array): string
export function readPublic(path: string): string
export function readRoot(path: string): string
export function listPublic(dir?: string): string[]
export function blankPng(w: number, h: number): Uint8Array
export function runScript(source: string, sandbox: object): void
