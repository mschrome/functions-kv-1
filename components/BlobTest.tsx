'use client';

import React, { useState, useCallback } from 'react';

export default function BlobTest() {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState('');

  const log = (msg: string) => {
    setResults((prev) => `${new Date().toLocaleTimeString()} | ${msg}\n${prev}`);
  };

  const api = useCallback(async (path: string, options?: RequestInit) => {
    setLoading(true);
    try {
      const res = await fetch(path, options);
      const data = await res.json();
      log(`${options?.method || 'GET'} ${path} → ${JSON.stringify(data)}`);
      return data;
    } catch (err: any) {
      log(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 写入文本
  const handleSetText = async () => {
    await api('/blob-set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'hello.txt', value: 'Hello, Blob! ' + Date.now() }),
    });
  };

  // 写入 JSON
  const handleSetJSON = async () => {
    await api('/blob-set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'config/settings.json',
        value: { theme: 'dark', lang: 'zh-CN', ts: Date.now() },
        json: true,
      }),
    });
  };

  // 写入带目录层级的对象
  const handleSetNested = async () => {
    const items = [
      { key: 'photos/2025/cat.txt', value: 'meow' },
      { key: 'photos/2025/dog.txt', value: 'woof' },
      { key: 'photos/2024/old.txt', value: 'archived' },
      { key: 'docs/readme.txt', value: 'read me' },
    ];
    for (const item of items) {
      await api('/blob-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    }
  };

  // 文件上传
  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('key', `uploads/${file.name}`);
      formData.append('value', file);
      await api('/blob-set', { method: 'POST', body: formData });
    };
    input.click();
  };

  // 条件写入（onlyIfNew）
  const handleSetOnlyIfNew = async () => {
    await api('/blob-set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'once-only.txt', value: 'first write wins', onlyIfNew: true }),
    });
  };

  // 读取
  const handleGet = async () => {
    await api('/blob-get?key=hello.txt');
  };

  // 读取 JSON
  const handleGetJSON = async () => {
    await api('/blob-get?key=config/settings.json&type=json');
  };

  // getWithHeaders
  const handleGetWithHeaders = async () => {
    await api('/blob-get-with-headers?key=hello.txt');
  };

  // 强一致性读取
  const handleGetStrong = async () => {
    await api('/blob-get?key=hello.txt&consistency=strong');
  };

  // 删除
  const handleDelete = async () => {
    await api('/blob-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'hello.txt' }),
    });
  };

  // 列表（平铺）
  const handleList = async () => {
    const p = prefix ? `&prefix=${encodeURIComponent(prefix)}` : '';
    await api(`/blob-list?directories=false${p}`);
  };

  // 列表（目录分组）
  const handleListDirs = async () => {
    const p = prefix ? `&prefix=${encodeURIComponent(prefix)}` : '';
    await api(`/blob-list?directories=true${p}`);
  };

  // 列举所有 Store
  const handleListStores = async () => {
    await api('/blob-list-stores');
  };

  // === Cloud Function 测试 ===
  const cfPost = async (path: string, body: any) => {
    await api(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const handleCfSet = () => cfPost('blob-set', { key: 'cf-hello.txt', value: 'Hello from Cloud Function! ' + Date.now() });
  const handleCfSetJSON = () => cfPost('blob-set', { key: 'cf-config/app.json', value: { env: 'test', ts: Date.now() }, json: true });
  const handleCfGet = () => cfPost('blob-get', { key: 'cf-hello.txt' });
  const handleCfGetStrong = () => cfPost('blob-get', { key: 'cf-hello.txt', consistency: 'strong' });
  const handleCfGetWithHeaders = () => cfPost('blob-get-with-headers', { key: 'cf-hello.txt' });
  const handleCfDelete = () => cfPost('blob-delete', { key: 'cf-hello.txt' });
  const handleCfList = () => cfPost('blob-list', { prefix: prefix || undefined, directories: true });
  const handleCfListStores = () => api('/api/blob-list-stores');

  // 清空日志
  const clearLog = () => setResults('');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">EdgeOne Pages: Blob Storage Test</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Edge Functions Store: <code className="text-blue-400">test-store</code> · 
          Cloud Functions Store: <code className="text-green-400">test-store-cf</code>
        </p>

        {/* 写入操作 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">写入 (set)</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSetText} className="btn">set 文本</button>
            <button onClick={handleSetJSON} className="btn">setJSON 对象</button>
            <button onClick={handleSetNested} className="btn">批量写入（多目录）</button>
            <button onClick={handleUpload} className="btn">上传文件</button>
            <button onClick={handleSetOnlyIfNew} className="btn">onlyIfNew 写入</button>
          </div>
        </section>

        {/* 读取操作 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">读取 (get)</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleGet} className="btn">get 文本</button>
            <button onClick={handleGetJSON} className="btn">get JSON</button>
            <button onClick={handleGetWithHeaders} className="btn">getWithHeaders</button>
            <button onClick={handleGetStrong} className="btn">get (strong)</button>
          </div>
        </section>

        {/* 删除 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">删除 (delete)</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDelete} className="btn btn-red">delete hello.txt</button>
          </div>
        </section>

        {/* 列表 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">列表 (list) — Edge Functions</h2>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm text-gray-400">Prefix:</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g. photos/"
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm w-48"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleList} className="btn">list（平铺）</button>
            <button onClick={handleListDirs} className="btn">list（目录分组）</button>
            <button onClick={handleListStores} className="btn">listStores</button>
          </div>
        </section>

        {/* Cloud Functions 测试 */}
        <section className="mb-6 border-t border-gray-800 pt-6">
          <h2 className="text-lg font-semibold mb-1 text-green-400">Cloud Functions 测试</h2>
          <p className="text-gray-500 text-xs mb-3">通过 /cf-blob-test 统一入口，store 名 test-store-cf</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCfSet} className="btn btn-cf">set 文本</button>
            <button onClick={handleCfSetJSON} className="btn btn-cf">setJSON</button>
            <button onClick={handleCfGet} className="btn btn-cf">get</button>
            <button onClick={handleCfGetStrong} className="btn btn-cf">get (strong)</button>
            <button onClick={handleCfGetWithHeaders} className="btn btn-cf">getWithHeaders</button>
            <button onClick={handleCfDelete} className="btn btn-cf btn-red">delete</button>
            <button onClick={handleCfList} className="btn btn-cf">list (dirs)</button>
            <button onClick={handleCfListStores} className="btn btn-cf">listStores</button>
          </div>
        </section>

        {/* 日志输出 */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-300">调用日志</h2>
            <button onClick={clearLog} className="text-xs text-gray-500 hover:text-gray-300">清空</button>
          </div>
          <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-xs font-mono h-64 overflow-y-auto whitespace-pre-wrap">
            {loading && <span className="text-yellow-400">请求中...\n</span>}
            {results || <span className="text-gray-600">点击上方按钮发起请求，结果将在此展示</span>}
          </pre>
        </section>
      </div>

      <style jsx>{`
        .btn {
          @apply px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm hover:bg-gray-700 hover:border-gray-600 transition-colors;
        }
        .btn-red {
          @apply border-red-900 text-red-400 hover:bg-red-950 hover:border-red-700;
        }
        .btn-cf {
          @apply border-green-900 text-green-400 hover:bg-green-950 hover:border-green-700;
        }
      `}</style>
    </div>
  );
}
