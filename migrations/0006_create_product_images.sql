CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  image_data TEXT NOT NULL CHECK (length(image_data) <= 1700000),
  uploaded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS product_images_uploaded_idx ON product_images(uploaded_at, id);
