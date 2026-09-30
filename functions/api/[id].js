import { errorResponse, problem } from "../../_shared/http.js";

const GALLERY_ID = /^gym-gallery-[0-9a-f-]{36}$/;
const IMAGE_DATA = /^data:image\/webp;base64,([A-Za-z0-9+/=]+)$/;

export async function onRequestGet({ env, params }) {
  try {
    const id = String(params.id || "");
    if (!GALLERY_ID.test(id)) throw problem("Gym photo not found.", 404);

    const row = await env.DB.prepare(
      "SELECT image_data FROM gym_gallery WHERE id = ?",
    ).bind(id).first();
    if (!row) throw problem("Gym photo not found.", 404);

    const match = String(row.image_data || "").match(IMAGE_DATA);
    if (!match) throw problem("Gym photo not found.", 404);
    const binary = atob(match[1]);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
