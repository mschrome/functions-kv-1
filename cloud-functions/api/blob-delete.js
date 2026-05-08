import { getStore } from "@edgeone/pages-blob";

/**
 * POST /api/blob-delete
 * Body JSON: { key }
 */
export default async function onRequest({ request }) {
  try {
    const { key } = await request.json();

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    const store = getStore("test-store-cf");
    await store.delete(key);

    return Response.json({ success: true, deleted: key, runtime: "cloud-function" });
  } catch (err) {
    return Response.json({ error: err.message || String(err), runtime: "cloud-function" }, { status: 500 });
  }
}
