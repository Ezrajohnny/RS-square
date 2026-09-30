import { getOwnerSession } from "../../../_shared/auth.js";
import { errorResponse, isSameOrigin, json, problem } from "../../../_shared/http.js";

const GALLERY_ID = /^gym-gallery-[0-9a-f-]{36}$/;

export async function onRequestDelete({ request, env, params }) {
  try {
    if (!(await getOwnerSession(request, env))) {
      throw problem("Owner sign-in required.", 401);
    }
    if (!isSameOrigin(request)) {
      throw problem("Request origin could not be verified.", 403);
    }

    const id = String(params.id || "");
    if (!GALLERY_ID.test(id)) throw problem("Gym photo not found.", 404);

    const result = await env.DB
      .prepare("DELETE FROM gym_gallery WHERE id = ?")
      .bind(id)
      .run();

    if (!result.meta?.changes) throw problem("Gym photo not found.", 404);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
