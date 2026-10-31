import { describe, expect, it } from 'vitest'
import { moduleSource } from './helpers/module-source'

type Box = { innerHTML: string }
type PhotoForm = { co: { photo_count?: number }; files: File[] }
type Button = { disabled: boolean }
type SubmitEvent = { preventDefault(): void; target: { querySelector(sel: string): Button } }

const box = (): Box => ({ innerHTML: '' })
const echo = <T>(v: T) => v

const loadUploadPhotos = (api: () => Promise<unknown>) =>
  new Function('api', 'resizePhoto', moduleSource('js/app/upload-photos.js') + 'return uploadPhotos')(api, (f: File) => Promise.resolve(f)) as (
    id: string, form: PhotoForm, msg: Box,
  ) => Promise<void>

const loadPickPhotos = () => {
  const els: Record<string, Box> = { 'form-msg': box(), previews: box() }
  const doc = { getElementById: (id: string) => els[id] }

  return new Function('esc', 'document', 'URL', moduleSource('js/app/pick-photos.js') + 'return pickPhotos')(echo, doc, { createObjectURL: () => 'blob:p' }) as (
    e: { target: { files: File[] } }, form: PhotoForm,
  ) => void
}

const loadSubmitJob = (api: () => Promise<{ id: string }>, msg: Box, navigate: (p: string) => void) => {
  const doc = { getElementById: () => msg }

  const fail = (el: Box, err: Error) => { el.innerHTML = err.message }

  const fieldValue = (id: string) => (id === 'j-orig' ? '18400' : 'Kitchen remodel')
  const deps = [() => undefined, api, fail, fieldValue, (id: string) => 'app/job/' + id, navigate, (v: string) => Number(v) * 100, doc]

  return new Function('track', 'api', 'fail', 'fieldValue', 'jobPath', 'navigate', 'toCents', 'document', moduleSource('js/app/submit-job.js') + 'return submitJob')(
    ...deps,
  ) as (e: SubmitEvent) => void
}

const deferred = <T>() => {
  let resolve!: (v: T) => void
  let reject!: (e: Error) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })

  return { promise, resolve, reject }
}

const settle = () => new Promise((r) => setTimeout(r, 0))

describe('photo count after a partial upload', () => {
  it('3 of 4 photos upload and the 4th fails: the form counts 3, and a new pick of 4 keeps only 1', async () => {
    let calls = 0
    const uploadPhotos = loadUploadPhotos(() => (++calls === 4 ? Promise.reject(new Error('Could not save the photo. Try again.')) : Promise.resolve({ n: calls })))
    const picked = [1, 2, 3, 4].map((n) => new File([new Uint8Array([n])], `p${n}.jpg`))
    const form: PhotoForm = { co: {}, files: [...picked] }

    await expect(uploadPhotos('co-1', form, box())).rejects.toThrow()
    expect(form.co.photo_count).toBe(3)
    expect(form.files).toEqual([picked[3]])

    loadPickPhotos()({ target: { files: picked } }, form)
    expect(form.files).toEqual([picked[0]])
  })

  it('counts on top of photos already attached to a saved draft', async () => {
    const form: PhotoForm = { co: { photo_count: 2 }, files: [new File([new Uint8Array([1])], 'p.jpg')] }

    await loadUploadPhotos(() => Promise.resolve({ n: 3 }))('co-1', form, box())
    expect(form.co.photo_count).toBe(3)
  })
})

describe('add job', () => {
  it('a second click while saving sends nothing, and a failed save lets the user try again', async () => {
    const pending = [deferred<{ id: string }>(), deferred<{ id: string }>()]
    const msg = box()
    const went: string[] = []
    let posts = 0
    const submitJob = loadSubmitJob(() => pending[posts++]!.promise, msg, (p) => went.push(p))
    const button: Button = { disabled: false }
    const event: SubmitEvent = { preventDefault: () => undefined, target: { querySelector: () => button } }

    submitJob(event)
    submitJob(event)
    expect(posts).toBe(1)
    expect(button.disabled).toBe(true)

    pending[0]!.reject(new Error('Network error. Try again.'))
    await settle()
    expect(button.disabled).toBe(false)
    expect(msg.innerHTML).toBe('Network error. Try again.')

    submitJob(event)
    submitJob(event)
    expect(posts).toBe(2)

    pending[1]!.resolve({ id: 'job-1' })
    await settle()
    expect(went).toEqual(['app/job/job-1'])
  })
})
