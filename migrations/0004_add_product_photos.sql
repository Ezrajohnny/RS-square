-- Add the supplied packshots to their matching existing supplement variants.
-- Keep all other product fields, including prices, unchanged.
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/ronnie-coleman-pro-antium.jpg') WHERE id = 'performance-whey' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/muscleblaze-wrath.jpg') WHERE id = 'pre-workout-wrathx' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[1].image', 'assets/products/on-creatine-tangy-orange.jpg') WHERE id = 'on-creatine-citrus-orange' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/gnc-creatine-monohydrate.jpg') WHERE id = 'creatine-monohydrate-unflavoured-100g' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/psychotic-pre-workout.jpg') WHERE id = 'pre-workout-35-servings' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[1].image', 'assets/products/elev-tri-whey.jpg') WHERE id = 'elev-tri-whey' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/musclepharm-combat-whey.jpg') WHERE id = 'musclepharm-product-details' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/kevin-levrone-anabolic-whey.jpg') WHERE id = 'premium-whey' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/bpi-whey-hd.jpg') WHERE id = 'whey-protein' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[1].image', 'assets/products/isopure-low-carb-dutch-chocolate.jpg') WHERE id = 'low-carb-dutch-chocolate-india' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/muscleblaze-turbo-whey.jpg') WHERE id = 'instant-whey' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/gnc-pro-performance-whey.jpg') WHERE id = 'pp-100-whey' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/armour-whey.jpg') WHERE id = 'armour-whey' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[1].image', 'assets/products/larry-wheels-whey.jpg') WHERE id = 'performance-whey' AND json_valid(data);
UPDATE products SET data = json_set(data, '$.variants[0].image', 'assets/products/muscletech-advanced-whey-protein.jpg') WHERE id = 'nitro-whey' AND json_valid(data);
