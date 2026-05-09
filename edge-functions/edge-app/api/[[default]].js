/**
 * Edge Function: Catch-all 兜底路由
 * 路由: /edge-app/api/*
 */
export default function onRequest(context) {
  const url = new URL(context.request.url);

  return new Response(
    JSON.stringify({
      error: "Not Found",
      path: url.pathname,
      method: context.request.method,
    }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
}
