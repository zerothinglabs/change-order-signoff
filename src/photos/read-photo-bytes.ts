import { jpegOk } from '../lib'
import { uploadedFile } from '../uploaded-file'
import { MAX_PHOTO_BYTES } from './constants'

export const readPhotoBytes = async (entry: File | string | null | undefined): Promise<Uint8Array | string> => {
  const file = uploadedFile(entry)

  if (!file) return 'Choose a JPEG photo.'
  if (file.size > MAX_PHOTO_BYTES) return 'Photo must be 2 MB or smaller.'

  const bytes = new Uint8Array(await file.arrayBuffer())

  return jpegOk(bytes) ? bytes : 'Photo must be a complete JPEG image.'
}
