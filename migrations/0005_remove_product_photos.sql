-- Clear the 15 packshot paths introduced by migration 0004.
-- Match both product/variant and image path so other photos are preserved.
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'performance-whey' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/ronnie-coleman-pro-antium.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'pre-workout-wrathx' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/muscleblaze-wrath.jpg';
UPDATE products SET data = json_set(data, '$.variants[1].image', '') WHERE id = 'on-creatine-citrus-orange' AND json_valid(data) AND json_extract(data, '$.variants[1].image') = 'assets/products/on-creatine-tangy-orange.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'creatine-monohydrate-unflavoured-100g' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/gnc-creatine-monohydrate.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'pre-workout-35-servings' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/psychotic-pre-workout.jpg';
UPDATE products SET data = json_set(data, '$.variants[1].image', '') WHERE id = 'elev-tri-whey' AND json_valid(data) AND json_extract(data, '$.variants[1].image') = 'assets/products/elev-tri-whey.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'musclepharm-product-details' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/musclepharm-combat-whey.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'premium-whey' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/kevin-levrone-anabolic-whey.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'whey-protein' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/bpi-whey-hd.jpg';
UPDATE products SET data = json_set(data, '$.variants[1].image', '') WHERE id = 'low-carb-dutch-chocolate-india' AND json_valid(data) AND json_extract(data, '$.variants[1].image') = 'assets/products/isopure-low-carb-dutch-chocolate.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'instant-whey' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/muscleblaze-turbo-whey.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'pp-100-whey' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/gnc-pro-performance-whey.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'armour-whey' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/armour-whey.jpg';
UPDATE products SET data = json_set(data, '$.variants[1].image', '') WHERE id = 'performance-whey' AND json_valid(data) AND json_extract(data, '$.variants[1].image') = 'assets/products/larry-wheels-whey.jpg';
UPDATE products SET data = json_set(data, '$.variants[0].image', '') WHERE id = 'nitro-whey' AND json_valid(data) AND json_extract(data, '$.variants[0].image') = 'assets/products/muscletech-advanced-whey-protein.jpg';
