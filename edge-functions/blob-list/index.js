import { getStore } from "@edgeone/pages-blob";

const store = getStore("functions-test");

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * GET /blob-list?prefix=xxx&directories=true&consistency=eventual|strong
 */
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const prefix = url.searchParams.get("prefix") || undefined;
    const directories = url.searchParams.get("directories") === "true";
    const consistency = url.searchParams.get("consistency") || "eventual";

    const result = await store.list({ prefix, directories, consistency });

    return json({
      blobs: result.blobs,
      directories: result.directories || [],
      count: result.blobs.length,
    });
  } catch (err) {
    return json({ error: err.message || String(err) }, 500);
  }
}
