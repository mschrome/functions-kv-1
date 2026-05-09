/**
 * Edge Function: 用户列表 & 创建
 * 路由: /edge-app/api/users
 */
import { getStore } from "@edgeone/pages-blob";

const store = getStore("functions-test");
const USERS_KEY = "edge-app/data/users.json";

export async function onRequestGet(context) {
  const data = await store.get(USERS_KEY, { type: "json" });
  const users = data || [];

  return new Response(JSON.stringify({ users }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const body = await context.request.json();
  const { name, email } = body;

  if (!name || !email) {
    return new Response(
      JSON.stringify({ error: "name and email are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await store.get(USERS_KEY, { type: "json" });
  const users = data || [];
  const newUser = { id: Date.now(), name, email };
  users.push(newUser);
  await store.setJSON(USERS_KEY, users);

  return new Response(JSON.stringify(newUser), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
