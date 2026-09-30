CREATE TABLE IF NOT EXISTS gym_gallery (
  id TEXT PRIMARY KEY,
  position INTEGER NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  image_data TEXT NOT NULL CHECK (length(image_data) <= 1700000),
  uploaded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS gym_gallery_order_idx ON gym_gallery(position, id);
