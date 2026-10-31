import { MAX_PHOTOS } from '../lib'

export const attachPhoto = async (db: D1Database, coId: string, key: string, prefix: string) => {
  const res = await db.prepare(
    `UPDATE change_orders SET photos_json = json_insert(photos_json, '$[#]', ?), photo_count = photo_count + 1,
       uploading = MAX(uploading - 1, 0), version = version + 1
     WHERE id = ? AND status = 'draft' AND photo_count < ? AND NOT EXISTS (SELECT 1 FROM json_each(photos_json) WHERE instr(value, ?) = 1)`,
  ).bind(key, coId, MAX_PHOTOS, prefix).run()

  return !!res.meta.changes
}
