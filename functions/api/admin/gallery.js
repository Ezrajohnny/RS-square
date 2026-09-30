import { getOwnerSession } from "../../_shared/auth.js";
import { errorResponse, isSameOrigin, json, problem, readJson } from "../../_shared/http.js";

const IMAGE_DATA = /^data:image\/webp;base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_BYTES = 1_200_000;

export async function onRequestPost({ request, env }) {
  try {
    if (!(await getOwnerSession(request, env))) throw problem("Owner sign-in required.", 401);
    if (!isSameOrigin(request)) throw problem("Request origin could not be verified.", 403);

    const body = await readJson(request, 1_800_000);
    const match = String(body.imageData || "").match(IMAGE_DATA);
    if (!match || match[1].length > MAX_IMAGE_BYTES * 4 / 3 + 8) {
      throw problem("Choose a gym photo that can be optimized below 1.2 MB.");
    }

    let binary;
    try {
      binary = atob(match[1]);
    } catch {
      throw problem("The gym photo could not be read.");
    }
    if (!binary.length || binary.length > MAX_IMAGE_BYTES) {
      throw problem("The optimized gym photo must be smaller than 1.2 MB.");
    }

    const id = "gym-gallery-" + crypto.randomUUID();
    const caption = String(body.caption || "").trim().slice(0, 120);
    const current = await env.DB.prepare(
      "SELECT COALESCE(MIN(position), 0) AS first_position FROM gym_gallery",
    ).first();
    const position = Number(current?.first_position ?? 0) - 1;
    const uploaded = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO gym_gallery (id, position, caption, image_data, uploaded_at) VALUES (?, ?, ?, ?, ?)",
    ).bind(id, position, caption, "data:image/webp;base64," + match[1], uploaded).run();

    return json({ image: { id, url: "/api/gallery/" + id, caption, uploaded } }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
