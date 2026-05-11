import { getStore } from "@edgeone/pages-blob";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * POST /blob-delete
 * Body JSON: { key: string }
 */
export async function onRequestPost(context) {
  try {
    const { key } = await context.request.json();

    if (!key) {
      return json({ error: "key is required" }, 400);
    }

    const store = getStore("functions-test");
    await store.delete(key);

    return json({ success: true, deleted: key });
  } catch (err) {
    return json({ error: err.message || String(err) }, 500);
  }
}
