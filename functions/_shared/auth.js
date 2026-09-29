const encoder = new TextEncoder();
const COOKIE_NAME = "rs_owner_session";
const SESSION_SECONDS = 12 * 60 * 60;

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function signingKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function ownerAuthConfigured(env) {
  return Boolean(
    env.ADMIN_USERNAME &&
    env.ADMIN_PASSWORD &&
    env.SESSION_SECRET &&
    env.SESSION_SECRET.length >= 32,
  );
}

export async function safeTextEqual(left, right) {
  const a = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(String(left))));
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(String(right))));
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

export async function createOwnerCookie(request, env) {
  const payload = encodeBase64Url(encoder.encode(JSON.stringify({
    sub: env.ADMIN_USERNAME,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })));
  const signature = new Uint8Array(await crypto.subtle.sign(
    "HMAC",
    await signingKey(env.SESSION_SECRET),
    encoder.encode(payload),
  ));
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return COOKIE_NAME + "=" + payload + "." + encodeBase64Url(signature) +
    "; HttpOnly; SameSite=Strict; Path=/; Max-Age=" + SESSION_SECONDS + secure;
}

export function clearOwnerCookie(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return COOKIE_NAME + "=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" + secure;
}

export async function getOwnerSession(request, env) {
  if (!ownerAuthConfigured(env)) return null;
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookie = cookieHeader.split(";").map(part => part.trim())
    .find(part => part.startsWith(COOKIE_NAME + "="));
  if (!cookie) return null;
  const value = cookie.slice(COOKIE_NAME.length + 1);
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  let signature;
  let session;
  try {
    signature = decodeBase64Url(value.slice(separator + 1));
    session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(env.SESSION_SECRET),
      signature,
      encoder.encode(payload),
    );
    if (!valid || session.sub !== env.ADMIN_USERNAME || session.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
  } catch {
    return null;
  }
  return session;
}
