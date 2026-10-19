import { canonicalJson, randomToken, sha256hex } from '../../lib'
import type { Snapshot } from '../../pdf'
import type { FrozenRecord } from '../types'

export const freezeRecord = async (snapshot: Snapshot, sentAt: string): Promise<FrozenRecord> => {
  const json = canonicalJson(snapshot)

  return { token: randomToken(24), json, sha: await sha256hex(json), sentAt }
}
