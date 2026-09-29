import { problem } from "./http.js";

export const CATEGORIES = new Set([
  "Whey Protein",
  "Isolate Protein",
  "Creatine",
  "Mass Gainers",
  "Pre-Workout",
  "Amino Acids",
  "Vitamins & Minerals",
  "Fish Oil & Wellness",
  "Other Supplements",
]);

const text = (value, max) => String(value ?? "").trim().slice(0, max);
const slugify = value => value.toLocaleLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "").slice(0, 65) || "product";

async function saveUploadedImage(data, env) {
  const match = String(data).match(/^data:image\/(webp|jpeg|png|gif);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw problem("Upload a JPG, PNG, WebP, or GIF product image.");
  if (match[2].length > 11 * 1024 * 1024) throw problem("Product images must be smaller than 8 MB.");
  if (!env.PRODUCT_IMAGES) throw problem("Product image storage is not connected yet.", 503);
  let binary;
  try {
    binary = atob(match[2]);
  } catch {
    throw problem("The product image could not be read.");
  }
  if (!binary.length || binary.length > 8 * 1024 * 1024) {
    throw problem("Product images must be smaller than 8 MB.");
  }
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  const key = crypto.randomUUID() + "." + extension;
  await env.PRODUCT_IMAGES.put(key, bytes, {
    httpMetadata: {
      contentType: "image/" + match[1],
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  return "/api/images/" + key;
}

export async function normalizeProduct(input, oldProduct, env) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw problem("Product information is missing.");
  }
  const name = text(input.name, 140);
  const brand = text(input.brand, 100);
  const category = String(input.category || "");
  if (!name) throw problem("Enter a product name under 140 characters.");
  if (!brand) throw problem("Enter a brand or keep “Brand not specified”.");
  if (!CATEGORIES.has(category)) throw problem("Choose one of the listed supplement categories.");
  if (!Array.isArray(input.variants) || !input.variants.length || input.variants.length > 80) {
    throw problem("A product needs at least one variant.");
  }

  const oldVariants = new Map((oldProduct?.variants || []).map(variant => [variant.id, variant]));
  const seen = new Set();
  const variants = [];
  for (const variantInput of input.variants) {
    if (!variantInput || typeof variantInput !== "object" || Array.isArray(variantInput)) {
      throw problem("A product variant is incomplete.");
    }
    const id = text(variantInput.id || "variant-" + crypto.randomUUID(), 140);
    if (!id || seen.has(id)) throw problem("Each flavor and size option needs its own ID.");
    seen.add(id);
    const price = Number(variantInput.price);
    if (!Number.isFinite(price) || price < 0 || price > 100000000) {
      throw problem("Enter a valid price in rupees for every variant.");
    }
    const previous = oldVariants.get(id);
    let image = text(variantInput.image || "", 2048);
    if (variantInput.imageData) image = await saveUploadedImage(variantInput.imageData, env);
    if (image && !/^(https?:\/\/|assets\/|\/api\/images\/)/i.test(image)) {
      throw problem("Image must be an http(s) URL or an uploaded product image.");
    }
    variants.push({
      id,
      flavor: text(variantInput.flavor, 120),
      origin: text(variantInput.origin, 120),
      size: text(variantInput.size, 120),
      price,
      entries: Array.isArray(variantInput.entries) ? variantInput.entries : (previous?.entries || []),
      image,
      imageSource: text(variantInput.imageSource || previous?.imageSource || "", 2048),
      review: text(variantInput.review || previous?.review || "", 1000),
    });
  }

  const requestedId = text(input.id || "", 100);
  const id = oldProduct?.id || requestedId ||
    slugify(name) + "-" + crypto.randomUUID().slice(0, 8);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(id)) {
    throw problem("The product identifier contains unsupported characters.");
  }
  return {
    id,
    name,
    brand,
    category,
    featured: Boolean(input.featured),
    variants,
  };
}
