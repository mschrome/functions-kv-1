import { getStore } from "@edgeone/pages-blob";

/**
 * GET /blob-list?prefix=xxx&directories=true&consistency=eventual|strong
 * 列举对象，支持目录分组和前缀过滤
 */
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const prefix = url.searchParams.get("prefix") || undefined;
    const directories = url.searchParams.get("directories") === "true";
    const consistency = url.searchParams.get("consistency") || "eventual";

    const store = getStore("test-store");
    const result = await store.list({ prefix, directories, consistency });

    return Response.json({
      blobs: result.blobs,
      directories: result.directories || [],
      count: result.blobs.length,
    });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
