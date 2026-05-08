import { getStore } from "@edgeone/pages-blob";

/**
 * POST /api/blob-get
 * Body JSON: { key, type?, consistency? }
 */
export default async function onRequest({ request }) {
  try {
    const { key, type = "text", consistency = "eventual" } = await request.json();

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    const store = getStore("test-store-cf");
    const value = await store.get(key, { type, consistency });

    if (value === null) {
      return Response.json({ error: "not found", key, runtime: "cloud-function" }, { status: 404 });
    }

    return Response.json({ key, value, runtime: "cloud-function" });
  } catch (err) {
    return Response.json({ error: err.message || String(err), runtime: "cloud-function" }, { status: 500 });
  }
}
