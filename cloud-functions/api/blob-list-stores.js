import { listStores } from "@edgeone/pages-blob";

/**
 * GET /api/blob-list-stores
 */
export default async function onRequest() {
  try {
    const { stores } = await listStores();

    return Response.json({ stores, count: stores.length, runtime: "cloud-function" });
  } catch (err) {
    return Response.json({ error: err.message || String(err), runtime: "cloud-function" }, { status: 500 });
  }
}
