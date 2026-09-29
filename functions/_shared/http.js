export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

export function errorResponse(error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  const message = status < 500 ? error.message : "The request could not be completed.";
  return json({ error: message }, status);
}

export function problem(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function readJson(request, maxBytes = 12 * 1024 * 1024) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw problem("The request is too large.", 413);
  }
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Expected an object.");
    }
    return value;
  } catch {
    throw problem("Please send valid JSON.", 400);
  }
}

export function isSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
