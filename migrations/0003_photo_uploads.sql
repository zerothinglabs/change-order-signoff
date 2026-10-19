-- Photo keys are committed only after the object is stored in R2. Uploads in flight are counted, with a lease, so a
-- send waits for them and a crashed upload does not block the draft for long.
ALTER TABLE change_orders ADD COLUMN photos_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE change_orders ADD COLUMN uploading INTEGER NOT NULL DEFAULT 0;
ALTER TABLE change_orders ADD COLUMN uploading_until TEXT;
UPDATE change_orders SET photos_json = CASE photo_count
  WHEN 1 THEN json_array('photo/' || id || '/1.jpg')
  WHEN 2 THEN json_array('photo/' || id || '/1.jpg', 'photo/' || id || '/2.jpg')
  WHEN 3 THEN json_array('photo/' || id || '/1.jpg', 'photo/' || id || '/2.jpg', 'photo/' || id || '/3.jpg')
  WHEN 4 THEN json_array('photo/' || id || '/1.jpg', 'photo/' || id || '/2.jpg', 'photo/' || id || '/3.jpg', 'photo/' || id || '/4.jpg')
  ELSE '[]' END;
