import { photoKeys } from './photo-keys'

export const photoNumber = (photosJson: string, key: string) => photoKeys(photosJson).indexOf(key) + 1
