import { z } from 'zod'

export const photoKeys = (photosJson: string) => z.array(z.string()).parse(JSON.parse(photosJson))
