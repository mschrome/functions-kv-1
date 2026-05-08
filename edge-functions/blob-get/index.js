import { getStore } from "@edgeone/pages-blob";

/**
 * GET /blob-get?key=xxx&type=text|json|arrayBuffer&consistency=eventual|strong
 */
export async function onRequest({ request }) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const type = url.searchParams.get("type") || "text";
    const consistency = url.searchParams.get("consistency") || "eventual";

    if (!key) {
      return Response.json({ error: "key is required" }, { status: 400 });
    }

    const store = getStore("test-store");
    const value = await store.get(key, { type, consistency });

    if (value === null) {
      return Response.json({ error: "not found", key }, { status: 404 });
    }

    // 如果是 arrayBuffer，返回二进制
    if (type === "arrayBuffer") {
      return new Response(value, {
        headers: { "content-type": "application/octet-stream" },
      });
    }

    // 如果是 json，直接返回
    if (type === "json") {
      return Response.json({ key, value });
    }

    // 默认 text
    return Response.json({ key, value });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
