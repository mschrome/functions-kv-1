import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-100">
          EdgeOne Pages: Storage Test
        </h1>
        <div className="space-y-4">
          <Link
            href="/blob"
            className="block w-full p-4 text-center bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            Blob 存储测试 →
          </Link>
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">KV 存储（原有）</p>
            <p className="text-gray-300 text-sm">
              访问 <code className="text-yellow-300">/visit</code> 触发计数器，
              <code className="text-yellow-300">/kv-list</code> 查看所有 key，
              <code className="text-yellow-300">/kv-batch-set</code> 批量写入。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
