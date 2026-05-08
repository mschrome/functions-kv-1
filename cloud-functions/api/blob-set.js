import { getStore } from "@edgeone/pages-blob";

/**
 * POST /api/blob-set
 * Body JSON: { key, value, onlyIfNew?, json? }
 */
export default async function onRequest({ request }) {
  try {
    const { key, value, onlyIfNew, json: isJSON } = await request.json();

    if (!key || value === undefined) {
      return Response.json({ error: "key and value are required" }, { status: 400 });
    }

    const store = getStore("test-store-cf");

    if (isJSON) {
      await store.setJSON(key, value, { onlyIfNew });
    } else {
      await store.set(key, String(value), { onlyIfNew });
    }

    return Response.json({ success: true, key, runtime: "cloud-function" });
  } catch (err) {
    return Response.json({ error: err.message || String(err), runtime: "cloud-function" }, { status: 500 });
  }
}
