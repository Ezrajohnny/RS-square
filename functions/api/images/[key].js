import { errorResponse, json, problem } from "../../_shared/http.js";

export async function onRequestGet({ env, params }) {
  try {
    const key = String(params.key || "");
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(key)) {
      throw problem("Image not found.", 404);
    }
    const row = await env.DB.prepare(
      "SELECT image_data FROM product_images WHERE id = ?",
    ).bind(key).first();
    if (!row) throw problem("Image not found.", 404);
    const match = String(row.image_data || "").match(/^data:image\/(webp|jpeg|png|gif);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw problem("Image not found.", 404);
    const binary = atob(match[2]);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/" + match[1],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
