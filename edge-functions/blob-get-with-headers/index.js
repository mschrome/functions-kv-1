import { getStore } from "@edgeone/pages-blob";

/**
 * GET /blob-get-with-headers?key=xxx&consistency=eventual|strong
 * 返回对象内容 + 完整响应头
 */
export async function onRequest({ request }) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const consistency = url.searchParams.get("consistency") || "eventual";

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    const store = getStore("test-store");
    const result = await store.getWithHeaders(key, { consistency });

    if (result === null) {
      return Response.json({ error: "not found", key }, { status: 404 });
    }

    return Response.json({
      key,
      body: result.body,
      headers: result.headers,
    });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
