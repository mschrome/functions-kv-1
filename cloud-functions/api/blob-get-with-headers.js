import { getStore } from "@edgeone/pages-blob";

/**
 * POST /api/blob-get-with-headers
 * Body JSON: { key, consistency? }
 */
export default async function onRequest({ request }) {
  try {
    const { key, consistency = "eventual" } = await request.json();

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    const store = getStore("test-store-cf");
    const result = await store.getWithHeaders(key, { consistency });

    if (result === null) {
      return Response.json({ error: "not found", key, runtime: "cloud-function" }, { status: 404 });
    }

    return Response.json({ key, body: result.body, headers: result.headers, runtime: "cloud-function" });
  } catch (err) {
    return Response.json({ error: err.message || String(err), runtime: "cloud-function" }, { status: 500 });
  }
}
