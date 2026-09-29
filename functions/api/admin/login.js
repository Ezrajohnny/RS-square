import { createOwnerCookie, ownerAuthConfigured, safeTextEqual } from "../../_shared/auth.js";
import { errorResponse, isSameOrigin, json, problem, readJson } from "../../_shared/http.js";

async function hash(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function onRequestPost({ request, env }) {
  try {
    if (!isSameOrigin(request)) throw problem("Request origin could not be verified.", 403);
    if (!ownerAuthConfigured(env)) {
      throw problem("Owner sign-in is not configured. Add the three owner secrets in Cloudflare.", 503);
    }
    const body = await readJson(request, 16 * 1024);
    const username = String(body.username || "");
    const password = String(body.password || "");
    if (username.length > 200 || password.length > 2000) throw problem("The username or password is incorrect.", 401);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipKey = await hash(ip);
    const now = Math.floor(Date.now() / 1000);
    const prior = await env.DB.prepare(
      "SELECT count, window_started FROM login_attempts WHERE ip_key = ?",
    ).bind(ipKey).first();
    const activeWindow = prior && now - Number(prior.window_started) < 900;
    if (activeWindow && Number(prior.count) >= 8) {
      throw problem("Too many sign-in attempts. Wait 15 minutes, then try again.", 429);
    }

    const [usernameMatches, passwordMatches] = await Promise.all([
      safeTextEqual(env.ADMIN_USERNAME, username),
      safeTextEqual(env.ADMIN_PASSWORD, password),
    ]);
    if (!usernameMatches || !passwordMatches) {
      await env.DB.prepare(
        "INSERT INTO login_attempts (ip_key, count, window_started) VALUES (?, 1, ?) " +
        "ON CONFLICT(ip_key) DO UPDATE SET " +
        "count = CASE WHEN ? THEN login_attempts.count + 1 ELSE 1 END, " +
        "window_started = CASE WHEN ? THEN login_attempts.window_started ELSE excluded.window_started END",
      ).bind(ipKey, now, Boolean(activeWindow) ? 1 : 0, Boolean(activeWindow) ? 1 : 0).run();
      throw problem("The username or password is incorrect.", 401);
    }

    await env.DB.prepare("DELETE FROM login_attempts WHERE ip_key = ?").bind(ipKey).run();
    return json({ ok: true }, 200, { "Set-Cookie": await createOwnerCookie(request, env) });
  } catch (error) {
    return errorResponse(error);
  }
}
