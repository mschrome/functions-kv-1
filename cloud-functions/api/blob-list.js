import { getStore } from "@edgeone/pages-blob";

/**
 * POST /api/blob-list
 * Body JSON: { prefix?, directories?, consistency? }
 */
export default async function onRequest({ request }) {
  try {
    const { prefix, directories = false, consistency = "eventual" } = await request.json();

    const store = getStore("test-store-cf");
    const result = await store.list({ prefix, directories, consistency });

    return Response.json({
      blobs: result.blobs,
      directories: result.directories || [],
      count: result.blobs.length,
      runtime: "cloud-function",
    });
  } catch (err) {
    return Response.json({ error: err.message || String(err), runtime: "cloud-function" }, { status: 500 });
  }
}
