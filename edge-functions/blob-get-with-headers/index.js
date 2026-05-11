import { getStore } from "@edgeone/pages-blob";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * GET /blob-get-with-headers?key=xxx&consistency=eventual|strong
 */
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key");
    const consistency = url.searchParams.get("consistency") || "eventual";

    if (!key) {
      return json({ error: "key is required" }, 400);
    }

    const store = getStore("functions-test");
    const result = await store.getWithHeaders(key, { consistency });

    if (result === null) {
      return json({ error: "not found", key }, 404);
    }

    return json({ key, body: result.body, headers: result.headers });
  } catch (err) {
    return json({ error: err.message || String(err) }, 500);
  }
}
