import { errorResponse, json, problem } from "../../_shared/http.js";

export async function onRequestGet({ env, params }) {
  try {
    const key = String(params.key || "");
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(key)) {
      throw problem("Image not found.", 404);
    }
    const object = await env.PRODUCT_IMAGES.get(key);
    if (!object) throw problem("Image not found.", 404);
    const headers = new Headers({
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    object.writeHttpMetadata(headers);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/octet-stream");
    return new Response(object.body, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
