import { getOwnerSession } from "./_shared/auth.js";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname === "/admin.html" && !(await getOwnerSession(context.request, context.env))) {
    return Response.redirect(new URL("/admin-login.html", url), 302);
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (url.pathname === "/admin-login.html" || url.pathname === "/admin.html") {
    headers.set("Cache-Control", "no-store");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
