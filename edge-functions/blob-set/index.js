import { getStore } from "@edgeone/pages-blob";

/**
 * POST /blob-set
 * Body: FormData { key: string, value: File | string, onlyIfNew?: "true" }
 * 或 JSON { key: string, value: string, onlyIfNew?: boolean, json?: boolean }
 */
export async function onRequestPost(context) {
  try {
    const request = context.request;
    const contentType = request.headers.get("content-type") || "";
    const store = getStore("test-store");

    if (contentType.includes("multipart/form-data")) {
      // 文件上传模式
      const formData = await request.formData();
      const key = formData.get("key");
      const file = formData.get("value");
      const onlyIfNew = formData.get("onlyIfNew") === "true";

      if (!key || !file) {
        return Response.json({ error: "key and value are required" }, { status: 400 });
      }

      await store.set(key, file, { onlyIfNew });

      return Response.json({
        success: true,
        key,
        size: file.size || null,
      });
    } else {
      // JSON 模式
      const body = await request.json();
      const { key, value, onlyIfNew, json } = body;

      if (!key || value === undefined) {
        return Response.json({ error: "key and value are required" }, { status: 400 });
      }

      if (json) {
        await store.setJSON(key, value, { onlyIfNew });
      } else {
        await store.set(key, String(value), { onlyIfNew });
      }

      return Response.json({ success: true, key });
    }
  } catch (err) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
