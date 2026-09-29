import { getOwnerSession, ownerAuthConfigured } from "../../_shared/auth.js";
import { errorResponse, json } from "../../_shared/http.js";

export async function onRequestGet({ request, env }) {
  try {
    return json({
      authenticated: Boolean(await getOwnerSession(request, env)),
      configured: ownerAuthConfigured(env),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
