# EdgeOne Pages: Storage Test (KV + Blob)

基于 Next.js 14 的 EdgeOne Pages 存储测试项目，同时包含 KV 和 Blob 两种存储的测试 Functions，覆盖 Edge Functions 和 Cloud Functions 两种运行时。

## 项目结构

```
edge-functions/               ← Edge Functions（边缘函数，文件夹即路由）
├── visit/                    KV 计数器（原有）
├── kv-batch-set/             KV 批量写入（原有）
├── kv-list/                  KV 遍历所有 key（原有）
├── blob-set/                 Blob 写入（text/JSON/文件上传/onlyIfNew）
├── blob-get/                 Blob 读取（text/json/arrayBuffer/strong）
├── blob-get-with-headers/    Blob 读取 + 响应头
├── blob-delete/              Blob 删除
├── blob-list/                Blob 列举（prefix/directories）
└── blob-list-stores/         列举所有命名空间

cloud-functions/              ← Cloud Functions（云函数，文件即路由）
└── api/
    ├── blob-set.js           POST /api/blob-set
    ├── blob-get.js           POST /api/blob-get
    ├── blob-get-with-headers.js  POST /api/blob-get-with-headers
    ├── blob-delete.js        POST /api/blob-delete
    ├── blob-list.js          POST /api/blob-list
    └── blob-list-stores.js   GET  /api/blob-list-stores
```

## 页面

- `/` — 首页导航
- `/blob` — Blob 存储交互测试页

## 测试说明

### Edge Functions（蓝色按钮）

每个 Blob 操作独立一个 Function 端点，Store 名为 `test-store`：
- `POST /blob-set` — 写入
- `GET /blob-get?key=xxx` — 读取
- `GET /blob-get-with-headers?key=xxx` — 读取 + 响应头
- `POST /blob-delete` — 删除
- `GET /blob-list?prefix=xxx&directories=true` — 列举
- `GET /blob-list-stores` — 列举命名空间

### Cloud Functions（绿色按钮）

文件即路由，每个操作独立文件，Store 名为 `test-store-cf`：
- `POST /api/blob-set` — 写入
- `POST /api/blob-get` — 读取
- `POST /api/blob-get-with-headers` — 读取 + 响应头
- `POST /api/blob-delete` — 删除
- `POST /api/blob-list` — 列举
- `GET  /api/blob-list-stores` — 列举命名空间

### 两者对比

两套 Functions 使用**完全相同的 SDK API**（`@edgeone/pages-blob`），但运行在不同的运行时环境。通过对比响应中的 `runtime` 字段可区分来源。

## 部署

```bash
npm install
npm run build
# 通过 EdgeOne Pages 部署
```

部署后访问 `/blob` 页面即可交互测试。
