import { errorResponse, json } from "../_shared/http.js";

export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(
      "SELECT id, caption, uploaded_at FROM gym_gallery ORDER BY position, id",
    ).all();
    const images = (result.results || []).map(row => ({
      id: row.id,
      url: "/api/gallery/" + encodeURIComponent(row.id),
      caption: row.caption || "",
      uploaded: row.uploaded_at || "",
    }));
    return json({ images });
  } catch (error) {
    return errorResponse(error);
  }
}
