import { getOwnerSession } from "../../../../_shared/auth.js";
import { errorResponse, isSameOrigin, json, problem, readJson } from "../../../../_shared/http.js";
import { normalizeProduct } from "../../../../_shared/products.js";

export async function onRequestPut({ request, env, params }) {
  try {
    if (!(await getOwnerSession(request, env))) throw problem("Owner sign-in required.", 401);
    if (!isSameOrigin(request)) throw problem("Request origin could not be verified.", 403);
    const id = String(params.id || "");
    const row = await env.DB.prepare("SELECT data FROM products WHERE id = ?").bind(id).first();
    if (!row) throw problem("Product not found.", 404);
    const previous = JSON.parse(row.data);
    const body = await readJson(request);
    const product = await normalizeProduct({ ...body.product, id }, previous, env);
    await env.DB.prepare("UPDATE products SET data = ? WHERE id = ?")
      .bind(JSON.stringify(product), id).run();
    return json({ product });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    if (!(await getOwnerSession(request, env))) throw problem("Owner sign-in required.", 401);
    if (!isSameOrigin(request)) throw problem("Request origin could not be verified.", 403);
    const result = await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(String(params.id || "")).run();
    if (!result.meta?.changes) throw problem("Product not found.", 404);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
