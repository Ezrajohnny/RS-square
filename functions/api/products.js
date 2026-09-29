import { errorResponse, json } from "../_shared/http.js";

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare("SELECT data FROM products ORDER BY position, id").all();
    return json((result.results || []).map(row => JSON.parse(row.data)));
  } catch (error) {
    return errorResponse(error);
  }
}
