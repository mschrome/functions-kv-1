import { getStore } from "@edgeone/pages-blob";

/**
 * POST /blob-delete
 * Body JSON: { key: string }
 */
export async function onRequestPost(context) {
  try {
    const { key } = await context.request.json();

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    const store = getStore("test-store");
    await store.delete(key);

    return Response.json({ success: true, deleted: key });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
