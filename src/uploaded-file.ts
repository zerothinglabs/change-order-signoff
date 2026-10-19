export const uploadedFile = (entry: File | string | null | undefined) => (entry && typeof entry !== 'string' ? entry : null)
