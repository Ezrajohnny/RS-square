import { getOwnerSession } from "../../_shared/auth.js";
import { errorResponse, isSameOrigin, json, problem, readJson } from "../../_shared/http.js";
import { normalizeProduct } from "../../_shared/products.js";

export async function onRequestPost({ request, env }) {
  try {
    if (!(await getOwnerSession(request, env))) throw problem("Owner sign-in required.", 401);
    if (!isSameOrigin(request)) throw problem("Request origin could not be verified.", 403);
    const body = await readJson(request);
    const product = await normalizeProduct(body.product, null, env);
    const current = await env.DB.prepare("SELECT COALESCE(MAX(position), -1) AS last_position FROM products").first();
    const position = Number(current?.last_position ?? -1) + 1;
    await env.DB.prepare("INSERT INTO products (id, position, data) VALUES (?, ?, ?)")
      .bind(product.id, position, JSON.stringify(product)).run();
    return json({ product }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
