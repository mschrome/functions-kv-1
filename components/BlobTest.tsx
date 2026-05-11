'use client';

import React, { useState, useCallback } from 'react';

/** 请求结果类型 */
type CallResult = {
  ok: boolean;
  status: number;
  data?: any;
  rawText?: string;
  error?: string;
};

export default function BlobTest() {
  const [logs, setLogs] = useState<
    { time: string; group: string; label: string; method: string; path: string; result: CallResult }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState('');

  /** 统一的请求函数，安全解析响应 */
  const call = useCallback(
    async (group: string, label: string, method: string, path: string, init?: RequestInit): Promise<CallResult> => {
      setLoading(true);
      try {
        const res = await fetch(path, { method, ...init });
        const rawText = await res.text();
        let data: any = undefined;
        try {
          data = JSON.parse(rawText);
        } catch {
          // 非 JSON
        }
        const result: CallResult = { ok: res.ok, status: res.status, data, rawText };
        setLogs((prev) => [
          { time: new Date().toLocaleTimeString(), group, label, method, path, result },
          ...prev,
        ]);
        return result;
      } catch (err: any) {
        const result: CallResult = { ok: false, status: 0, error: err.message || String(err) };
        setLogs((prev) => [
          { time: new Date().toLocaleTimeString(), group, label, method, path, result },
          ...prev,
        ]);
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Edge Functions — 独立目录（/blob-xxx） */
  const edgeTests = [
    {
      label: 'set 文本',
      method: 'POST',
      path: '/blob-set',
      run: () =>
        call('edge', 'set 文本', 'POST', '/blob-set', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'hello.txt', value: 'Hello, Blob! ' + Date.now() }),
        }),
    },
    {
      label: 'setJSON 对象',
      method: 'POST',
      path: '/blob-set',
      run: () =>
        call('edge', 'setJSON 对象', 'POST', '/blob-set', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'config/settings.json',
            value: { theme: 'dark', lang: 'zh-CN', ts: Date.now() },
            json: true,
          }),
        }),
    },
    {
      label: 'onlyIfNew 写入',
      method: 'POST',
      path: '/blob-set',
      run: () =>
        call('edge', 'onlyIfNew 写入', 'POST', '/blob-set', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'once-only.txt', value: 'first write wins', onlyIfNew: true }),
        }),
    },
    { label: 'get 文本', method: 'GET', path: '/blob-get?key=hello.txt', run: () => call('edge', 'get 文本', 'GET', '/blob-get?key=hello.txt') },
    {
      label: 'get JSON',
      method: 'GET',
      path: '/blob-get?key=config/settings.json&type=json',
      run: () => call('edge', 'get JSON', 'GET', '/blob-get?key=config/settings.json&type=json'),
    },
    {
      label: 'getWithHeaders',
      method: 'GET',
      path: '/blob-get-with-headers?key=hello.txt',
      run: () => call('edge', 'getWithHeaders', 'GET', '/blob-get-with-headers?key=hello.txt'),
    },
    {
      label: 'get (strong)',
      method: 'GET',
      path: '/blob-get?key=hello.txt&consistency=strong',
      run: () => call('edge', 'get (strong)', 'GET', '/blob-get?key=hello.txt&consistency=strong'),
    },
    {
      label: 'delete hello.txt',
      method: 'POST',
      path: '/blob-delete',
      run: () =>
        call('edge', 'delete hello.txt', 'POST', '/blob-delete', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'hello.txt' }),
        }),
    },
    {
      label: 'list（平铺）',
      method: 'GET',
      path: '/blob-list',
      run: () => {
        const p = prefix ? `&prefix=${encodeURIComponent(prefix)}` : '';
        return call('edge', 'list（平铺）', 'GET', `/blob-list?directories=false${p}`);
      },
    },
    {
      label: 'list（目录分组）',
      method: 'GET',
      path: '/blob-list',
      run: () => {
        const p = prefix ? `&prefix=${encodeURIComponent(prefix)}` : '';
        return call('edge', 'list（目录分组）', 'GET', `/blob-list?directories=true${p}`);
      },
    },
    { label: 'listStores', method: 'GET', path: '/blob-list-stores', run: () => call('edge', 'listStores', 'GET', '/blob-list-stores') },
  ];

  /** edge-app — 嵌套文件路由（作为对照组，确认已知能跑的写法） */
  const edgeAppTests = [
    {
      label: 'GET /edge-app',
      method: 'GET',
      path: '/edge-app',
      run: () => call('edge-app', 'GET /edge-app', 'GET', '/edge-app'),
    },
    {
      label: 'GET /edge-app/api/users',
      method: 'GET',
      path: '/edge-app/api/users',
      run: () => call('edge-app', 'GET /edge-app/api/users', 'GET', '/edge-app/api/users'),
    },
    {
      label: 'POST /edge-app/api/users',
      method: 'POST',
      path: '/edge-app/api/users',
      run: () =>
        call('edge-app', 'POST /edge-app/api/users', 'POST', '/edge-app/api/users', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Alice', email: 'alice@test.com' }),
        }),
    },
    {
      label: 'GET /edge-app/api/not-exist',
      method: 'GET',
      path: '/edge-app/api/not-exist',
      run: () => call('edge-app', 'GET /edge-app/api/not-exist (catch-all)', 'GET', '/edge-app/api/not-exist'),
    },
  ];

  /** Cloud Functions — 文件路由（/api/blob-xxx） */
  const cfTests = [
    {
      label: 'set 文本',
      method: 'POST',
      path: '/api/blob-set',
      run: () =>
        call('cf', 'set 文本', 'POST', '/api/blob-set', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'cf-hello.txt', value: 'Hello from Cloud Function! ' + Date.now() }),
        }),
    },
    {
      label: 'setJSON',
      method: 'POST',
      path: '/api/blob-set',
      run: () =>
        call('cf', 'setJSON', 'POST', '/api/blob-set', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'cf-config/app.json', value: { env: 'test', ts: Date.now() }, json: true }),
        }),
    },
    {
      label: 'get',
      method: 'POST',
      path: '/api/blob-get',
      run: () =>
        call('cf', 'get', 'POST', '/api/blob-get', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'cf-hello.txt' }),
        }),
    },
    {
      label: 'get (strong)',
      method: 'POST',
      path: '/api/blob-get',
      run: () =>
        call('cf', 'get (strong)', 'POST', '/api/blob-get', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'cf-hello.txt', consistency: 'strong' }),
        }),
    },
    {
      label: 'getWithHeaders',
      method: 'POST',
      path: '/api/blob-get-with-headers',
      run: () =>
        call('cf', 'getWithHeaders', 'POST', '/api/blob-get-with-headers', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'cf-hello.txt' }),
        }),
    },
    {
      label: 'delete',
      method: 'POST',
      path: '/api/blob-delete',
      run: () =>
        call('cf', 'delete', 'POST', '/api/blob-delete', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'cf-hello.txt' }),
        }),
    },
    {
      label: 'list (dirs)',
      method: 'POST',
      path: '/api/blob-list',
      run: () =>
        call('cf', 'list (dirs)', 'POST', '/api/blob-list', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix: prefix || undefined, directories: true }),
        }),
    },
    { label: 'listStores', method: 'GET', path: '/api/blob-list-stores', run: () => call('cf', 'listStores', 'GET', '/api/blob-list-stores') },
  ];

  const clearLogs = () => setLogs([]);

  /** 渲染日志行：智能展示 JSON / 原始文本 / 错误 */
  const renderResult = (r: CallResult) => {
    if (r.error) return <span className="text-red-400">FETCH ERROR: {r.error}</span>;

    const statusColor =
      r.status >= 200 && r.status < 300 ? 'text-green-400' : r.status >= 400 ? 'text-red-400' : 'text-yellow-400';

    if (r.data !== undefined) {
      return (
        <>
          <span className={statusColor}>[{r.status}]</span>{' '}
          <span className="text-gray-200">{JSON.stringify(r.data)}</span>
        </>
      );
    }
    // 非 JSON 响应 → 显示原始文本前 300 字符
    const snippet = (r.rawText || '').slice(0, 300).replace(/\s+/g, ' ');
    return (
      <>
        <span className={statusColor}>[{r.status}]</span>{' '}
        <span className="text-orange-400">非 JSON 响应：</span>
        <span className="text-gray-400">{snippet || '(空)'}</span>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-2">EdgeOne Pages: Blob Storage Test</h1>
          <div className="text-xs text-gray-400 space-y-0.5">
            <div>
              <span className="inline-block w-24 text-blue-400 font-semibold">Edge Functions</span>
              <span className="text-gray-500">目录：</span>
              <code className="text-blue-300">edge-functions/blob-*/index.js</code>
              <span className="text-gray-500"> · 路径：</span>
              <code>/blob-*</code>
              <span className="text-gray-500"> · store：</span>
              <code className="text-blue-300">test-store</code>
            </div>
            <div>
              <span className="inline-block w-24 text-purple-400 font-semibold">edge-app</span>
              <span className="text-gray-500">目录：</span>
              <code className="text-purple-300">edge-functions/edge-app/...</code>
              <span className="text-gray-500"> · 路径：</span>
              <code>/edge-app/*</code>
              <span className="text-gray-500"> · store：</span>
              <code className="text-purple-300">functions-test</code>
              <span className="text-gray-500"> · （对照组，已知能跑）</span>
            </div>
            <div>
              <span className="inline-block w-24 text-green-400 font-semibold">Cloud Funcs</span>
              <span className="text-gray-500">目录：</span>
              <code className="text-green-300">cloud-functions/api/blob-*.js</code>
              <span className="text-gray-500"> · 路径：</span>
              <code>/api/blob-*</code>
              <span className="text-gray-500"> · store：</span>
              <code className="text-green-300">test-store-cf</code>
            </div>
          </div>
        </header>

        {/* 公共过滤 */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <label className="text-gray-400">List Prefix:</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="e.g. photos/"
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 w-48"
          />
        </div>

        {/* 三栏测试组 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Edge Functions */}
          <section className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
            <h2 className="text-sm font-bold mb-3 text-blue-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Edge Functions
            </h2>
            <div className="flex flex-col gap-1.5">
              {edgeTests.map((t, i) => (
                <button
                  key={i}
                  onClick={t.run}
                  className="group text-left px-3 py-1.5 bg-gray-900 hover:bg-blue-900/40 border border-gray-800 hover:border-blue-800 rounded text-xs transition-colors"
                >
                  <span className="text-gray-200">{t.label}</span>
                  <span className="block text-gray-600 group-hover:text-blue-300 text-[10px] mt-0.5">
                    {t.method} {t.path}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* edge-app 对照组 */}
          <section className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-4">
            <h2 className="text-sm font-bold mb-3 text-purple-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              edge-app（对照组）
            </h2>
            <div className="flex flex-col gap-1.5">
              {edgeAppTests.map((t, i) => (
                <button
                  key={i}
                  onClick={t.run}
                  className="group text-left px-3 py-1.5 bg-gray-900 hover:bg-purple-900/40 border border-gray-800 hover:border-purple-800 rounded text-xs transition-colors"
                >
                  <span className="text-gray-200">{t.label}</span>
                  <span className="block text-gray-600 group-hover:text-purple-300 text-[10px] mt-0.5">
                    {t.method} {t.path}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Cloud Functions */}
          <section className="bg-green-950/30 border border-green-900/50 rounded-lg p-4">
            <h2 className="text-sm font-bold mb-3 text-green-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Cloud Functions
            </h2>
            <div className="flex flex-col gap-1.5">
              {cfTests.map((t, i) => (
                <button
                  key={i}
                  onClick={t.run}
                  className="group text-left px-3 py-1.5 bg-gray-900 hover:bg-green-900/40 border border-gray-800 hover:border-green-800 rounded text-xs transition-colors"
                >
                  <span className="text-gray-200">{t.label}</span>
                  <span className="block text-gray-600 group-hover:text-green-300 text-[10px] mt-0.5">
                    {t.method} {t.path}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 日志区 */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-300">
              调用日志 {loading && <span className="text-yellow-400 ml-2">· 请求中...</span>}
            </h2>
            <button onClick={clearLogs} className="text-xs text-gray-500 hover:text-gray-300">
              清空
            </button>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 h-96 overflow-y-auto font-mono text-[11px] leading-relaxed">
            {logs.length === 0 ? (
              <span className="text-gray-600">点击上方按钮发起请求</span>
            ) : (
              logs.map((log, i) => {
                const groupColor =
                  log.group === 'edge' ? 'text-blue-400' : log.group === 'edge-app' ? 'text-purple-400' : 'text-green-400';
                const groupLabel =
                  log.group === 'edge' ? 'EDGE' : log.group === 'edge-app' ? 'APP ' : 'CF  ';
                return (
                  <div key={i} className="mb-1.5 pb-1.5 border-b border-gray-800/50 last:border-b-0">
                    <span className="text-gray-600">{log.time}</span>{' '}
                    <span className={`${groupColor} font-bold`}>[{groupLabel}]</span>{' '}
                    <span className="text-gray-500">{log.method}</span>{' '}
                    <span className="text-gray-400">{log.path}</span>
                    <div className="pl-[72px] mt-0.5 break-all">{renderResult(log.result)}</div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
