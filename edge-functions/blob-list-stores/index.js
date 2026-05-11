import { listStores } from "@edgeone/pages-blob";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * GET /blob-list-stores
 */
export async function onRequestGet(context) {
  try {
    const { stores } = await listStores();

    return json({ stores, count: stores.length });
  } catch (err) {
    return json({ error: err.message || String(err) }, 500);
  }
}
