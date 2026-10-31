import { photoKeys } from './photo-keys'

export const photoNumber = (photosJson: string, prefix: string) => photoKeys(photosJson).findIndex((key) => key.startsWith(prefix)) + 1
