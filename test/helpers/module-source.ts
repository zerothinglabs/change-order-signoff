import { readPublic } from '../env'

export const moduleSource = (file: string) => readPublic(file).replace(/^import .*\n/gm, '').replace(/^export /gm, '')
