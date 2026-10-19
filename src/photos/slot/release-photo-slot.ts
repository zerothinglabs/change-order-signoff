export const releasePhotoSlot = (db: D1Database, coId: string) =>
  db.prepare('UPDATE change_orders SET uploading = MAX(uploading - 1, 0) WHERE id = ?').bind(coId).run()
