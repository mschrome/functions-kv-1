import { listStores } from "@edgeone/pages-blob";

/**
 * GET /blob-list-stores
 * 列举当前项目下所有命名空间
 */
export async function onRequest({ request }) {
  try {
    const { stores } = await listStores();

    return Response.json({
      stores,
      count: stores.length,
    });
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
