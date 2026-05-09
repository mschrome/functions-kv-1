/**
 * Edge Function: 单个用户操作（动态路由）
 * 路由: /edge-app/api/users/:id
 */
import { getStore } from "@edgeone/pages-blob";

const store = getStore("functions-test");
const USERS_KEY = "edge-app/data/users.json";

export async function onRequestGet(context) {
  const { id } = context.params;
  const data = await store.get(USERS_KEY, { type: "json" });
  const users = data || [];
  const user = users.find((u) => String(u.id) === String(id));

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestDelete(context) {
  const { id } = context.params;
  const data = await store.get(USERS_KEY, { type: "json" });
  const users = data || [];
  const idx = users.findIndex((u) => String(u.id) === String(id));

  if (idx === -1) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  users.splice(idx, 1);
  await store.setJSON(USERS_KEY, users);

  return new Response(JSON.stringify({ message: "Deleted" }), {
    headers: { "Content-Type": "application/json" },
  });
}
