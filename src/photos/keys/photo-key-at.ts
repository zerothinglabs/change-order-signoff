import { keyAtPosition } from './key-at-position'
import { photoKeys } from './photo-keys'

export const photoKeyAt = (photosJson: string, position: string) => keyAtPosition(photoKeys(photosJson), position)
