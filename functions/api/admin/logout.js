import { clearOwnerCookie } from "../../_shared/auth.js";
import { errorResponse, isSameOrigin, json, problem } from "../../_shared/http.js";

export async function onRequestPost({ request }) {
  try {
    if (!isSameOrigin(request)) throw problem("Request origin could not be verified.", 403);
    return json({ ok: true }, 200, { "Set-Cookie": clearOwnerCookie(request) });
  } catch (error) {
    return errorResponse(error);
  }
}
