import { getStore } from "@edgeone/pages-blob";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * POST /blob-set
 * Body: FormData { key: string, value: File | string, onlyIfNew?: "true" }
 * 或 JSON { key: string, value: string, onlyIfNew?: boolean, json?: boolean }
 */
export async function onRequestPost(context) {
  try {
    const request = context.request;
    const contentType = request.headers.get("content-type") || "";
    const store = getStore("functions-test");

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const key = formData.get("key");
      const file = formData.get("value");
      const onlyIfNew = formData.get("onlyIfNew") === "true";

      if (!key || !file) {
        return json({ error: "key and value are required" }, 400);
      }

      await store.set(key, file, { onlyIfNew });

      return json({ success: true, key, size: file.size || null });
    } else {
      const body = await request.json();
      const { key, value, onlyIfNew, json: isJson } = body;

      if (!key || value === undefined) {
        return json({ error: "key and value are required" }, 400);
      }

      if (isJson) {
        await store.setJSON(key, value, { onlyIfNew });
      } else {
        await store.set(key, String(value), { onlyIfNew });
      }

      return json({ success: true, key });
    }
  } catch (err) {
    return json({ error: err.message || String(err) }, 500);
  }
}
