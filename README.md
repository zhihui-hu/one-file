<p align="center">
  <img src="https://img.huzhihui.com/uploads/2026/05/pwa-512x512.png" width="112" height="112" alt="OneFile Logo" />
</p>

<h1 align="center">OneFile</h1>

<p align="center">
  自托管、多云对象存储上传网关。
  <br />
  用一个后台管理 S3、R2、B2、OCI、阿里云 OSS、腾讯云 COS，并把上传能力开放给工具和朋友。
</p>

<p align="center">
  <a href="./README.en.md">English</a>
  ·
  <a href="https://onefile.huzhihui.com">在线预览</a>
  ·
  <a href="https://zhihui-hu.github.io/onefile/">中文文档</a>
  ·
  <a href="#quick-start">快速开始</a>
  ·
  <a href="#image-hosting-integration">图床接入</a>
  ·
  <a href="#supported-storage-providers">支持的存储</a>
  ·
  <a href="#license">许可证</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000?logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-282C34?logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn/ui-111827?logo=shadcnui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=tanstack&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/TanStack_Table-v8-FF4154?logo=tanstack&logoColor=white" alt="TanStack Table" />
  <img src="https://img.shields.io/badge/SQLite-lightweight-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

OneFile 是一个自托管的对象存储上传入口。你先用 GitHub OAuth 登录后台，接入自己的 OSS、COS、Cloudflare R2、AWS S3、Oracle Object Storage 等 bucket；之后可以在网页后台上传和管理文件，也可以创建 API key 给图床、Markdown 编辑器、脚本或 CI 使用，还可以生成一个公开上传链接发给朋友。朋友打开链接即可上传，不需要登录 GitHub，也看不到你的后台账号和原始 API key。

部署默认使用 SQLite 和 Docker volume，数据可以从后台导出为 SQL 备份，并在新环境导入恢复。大文件走 multipart 分片上传；网页上传队列支持暂停、继续和重试。

<h2 id="features">功能特性</h2>

| 能力                 | 说明                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| GitHub OAuth 登录    | 部署前创建 GitHub OAuth App，只用于你自己登录管理后台。                   |
| 多云存储管理         | 在一个后台里管理存储账号、bucket、公开访问地址和上传策略。                |
| 浏览器上传与文件浏览 | 上传文件、文件夹和剪贴板文件，浏览目录、搜索对象、预览图片、复制链接。    |
| API key 上传         | 给图床程序、Markdown 编辑器、脚本、CI 和第三方系统提供统一上传入口。      |
| 公开上传页           | 生成可分享的上传页面和二维码，朋友无需登录即可上传，也不会看到后台权限。  |
| 图片压缩             | API 上传和公开上传页可把图片转换为 WebP，适合博客、论坛和文档流程。       |
| 大文件上传           | 超过 100 MiB 的网页上传自动使用 multipart 分片流程，队列支持暂停和重试。  |
| 轻量部署             | 默认使用 SQLite，支持 Docker，面向单节点自托管场景。                      |
| 备份与迁移           | 管理员可导入导出 SQL 备份，并同步迁移后解密存储凭证所需的应用密钥。       |
| 自动 bucket 选择     | API key 未绑定固定 bucket 时，OneFile 可以为当前用户选择一个可用 bucket。 |

<h2 id="product-preview">产品预览</h2>

应用围绕存储账号、bucket、文件、API key 和公开上传链接组织。

<table>
  <tr>
    <td width="50%">
      <strong>文件管理</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-1.png" alt="OneFile 文件管理截图" />
    </td>
    <td width="50%">
      <strong>存储配置</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-2.png" alt="OneFile 存储配置截图" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>API key 与上传策略</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-3.png" alt="OneFile API key 截图" />
    </td>
    <td width="50%">
      <strong>公开上传页</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-4.png" alt="OneFile 公开上传页截图" />
    </td>
  </tr>
</table>

<h2 id="why-onefile">为什么是 OneFile</h2>

- **SQLite 优先，体积小**：默认部署不需要 MySQL、PostgreSQL 或 Redis。
- **登录边界清楚**：GitHub OAuth 只负责后台登录；公开上传页可以发给朋友，不要求对方有账号。
- **迁移简单**：管理员可从后台导出 SQL 备份，并在新环境导入恢复。
- **图床接入快**：创建 API key 后，用 `Authorization: Bearer ...` 上传即可。
- **上传后仍可管理**：外部工具上传的文件仍能在后台浏览、复制、预览和删除。
- **内置图片压缩**：可选 WebP 压缩，适合 Markdown、博客、论坛和文档图片。
- **多 bucket 工作流**：API key 可以绑定固定 bucket，也可以让 OneFile 从可用 bucket 中选择。
- **多 provider 抽象**：S3 兼容存储、OCI、阿里云 OSS 和腾讯云 COS 共用内部 adapter 接口。
- **服务端写入对象存储**：浏览器和外部工具只访问 OneFile，鉴权、压缩、bucket 选择和对象写入都在服务端完成。

<h2 id="use-cases">适用场景</h2>

- 自托管图床
- Markdown、博客和论坛图片上传
- 给外部工具提供统一上传 API
- 管理多个对象存储账号和 bucket
- 给朋友或临时协作者开放一个无需登录的上传入口
- CI 产物、备份文件和媒体文件上传

<h2 id="supported-storage-providers">支持的存储服务</h2>

| Provider              | 接入方式                                    |
| --------------------- | ------------------------------------------- |
| AWS S3                | 标准 S3 API                                 |
| Cloudflare R2         | S3 兼容 API                                 |
| Backblaze B2          | S3 兼容 API                                 |
| Oracle Object Storage | OCI Object Storage API，带 S3 兼容 fallback |
| 阿里云 OSS            | 阿里云 OSS SDK                              |
| 腾讯云 COS            | 腾讯云 COS SDK                              |

<h2 id="architecture">架构</h2>

```mermaid
flowchart LR
  user["登录用户 / 管理后台"]
  tools["图床 / Markdown 编辑器 / 脚本 / CI"]
  public["公开上传链接 / 二维码"]

  app["OneFile<br/>Next.js 应用"]
  auth["GitHub OAuth<br/>Session / API key"]
  db["SQLite<br/>用户、账号、bucket、API key、上传状态"]
  backup["SQL 导入导出<br/>备份与迁移"]

  scheduler["上传编排<br/>压缩 / bucket 选择"]
  single["直接上传 API<br/>小文件 / 图片压缩"]
  multipart["Multipart 上传 API<br/>服务端分片流程"]

  storage["对象存储<br/>S3 / R2 / B2 / OCI / OSS / COS"]

  user --> app
  tools -->|"Bearer API key"| app
  public -->|"UUID 上传页"| app

  app --> auth
  app <--> db
  db <--> backup
  app --> scheduler

  scheduler --> single
  scheduler --> multipart
  single --> storage
  multipart --> storage

  app -->|"浏览 / 删除 / 复制链接"| storage
```

<h2 id="quick-start">快速开始</h2>

最快的方式是运行 GHCR 镜像。默认服务端口是 `27507`，持久化数据保存在 Docker volume `onefile-data`。

部署前请先准备两类东西：

- **GitHub OAuth App**：OneFile 当前使用 GitHub OAuth 登录后台。这个 OAuth App 是给管理员登录用的，不是给朋友上传用的。
- **对象存储访问凭证**：比如 OSS、COS、R2、S3、OCI 的 access key、secret、region、endpoint、bucket 等信息。启动后在后台添加，不需要写进 Docker 命令。

1. 创建 GitHub OAuth App，并设置 callback URL：

   ```text
   https://你的域名/callback/auth
   ```

   本地测试时可以填：

   ```text
   http://localhost:27507/callback/auth
   ```

2. 运行容器：

   ```bash
   docker run -d --name onefile --restart unless-stopped \
     -p 27507:27507 \
     -e GITHUB_CLIENT_ID=your_github_client_id \
     -e GITHUB_CLIENT_SECRET=your_github_client_secret \
     -v onefile-data:/app/data \
     ghcr.io/zhihui-hu/onefile:latest
   ```

3. 打开应用：

   ```text
   http://你的服务器IP:27507
   ```

4. 登录后：
   - 添加对象存储账号。
   - 同步 bucket。
   - 配置每个 bucket 的公开访问地址。
   - 创建 API key。
   - 在图床、脚本、编辑器或上传工具中使用这个 API key。
   - 复制 API key 对应的公开上传链接或二维码，发给朋友上传文件。

<h2 id="public-upload">给朋友开放上传</h2>

每个 API key 创建后都会生成一个公开上传 UUID。你可以在 API key 列表里复制公开链接或二维码，把它发给朋友、同事或临时协作者。

- 访问者不需要登录 GitHub。
- 访问者不会看到后台、存储账号、bucket 密钥或原始 API key。
- 上传会沿用这个 API key 的权限、bucket 绑定和图片压缩设置。
- 不想继续开放时，可以撤销公开链接，或直接禁用 / 删除 API key。

这适合收集截图、素材、文档附件、临时交付文件等场景。

<h2 id="image-hosting-integration">图床接入</h2>

OneFile 的 API key 面向外部上传流程设计。在应用内创建 API key 后，把它放到请求 Header 中：

```text
Authorization: Bearer ofk_xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

常见接入方式有两种：

- **API 上传**：适合图床程序、Markdown 编辑器、脚本、CI 和第三方系统。
- **公开上传页**：适合分享一个浏览器上传页面，访问者无需看到原始 API key。

上传后的图片仍可在 OneFile 中管理。如果启用图片压缩，支持的图片会转换为 WebP。如果 API key 没有固定 bucket，OneFile 会为当前用户选择一个可用 bucket。

如果只是想让别人用浏览器上传，请优先使用公开上传页；如果是程序、图床客户端、CI 或编辑器接入，再使用 bearer token。

<h2 id="tech-stack">技术栈</h2>

- **前端**：Next.js 16、React 19、TypeScript、Tailwind CSS 4、shadcn/ui、Lucide React
- **客户端数据与表格**：TanStack Query v5、TanStack Table v8
- **后端**：运行在 Node.js 上的 Next.js Route Handlers
- **数据库**：Drizzle ORM + `better-sqlite3`
- **存储**：AWS SDK 支持 S3 兼容 provider，另有阿里云 OSS SDK、腾讯云 COS SDK 和 OCI adapter
- **部署**：Docker / Docker Compose，镜像为 `ghcr.io/zhihui-hu/onefile:latest`

<h2 id="project-structure">项目结构</h2>

```text
src/app/                         Next.js App Router 页面和 API 路由
src/app/api/**/route.ts          Node.js 后端接口
src/app/(main)/components/       主文件管理后台
src/app/[uuid]/                  公开上传页面
src/app/api-docs/                应用内 API 文档
src/lib/db/                      SQLite client、Drizzle schema、SQL 备份工具
src/lib/storage/                 存储 provider adapter 和共享类型
src/lib/auth/                    GitHub OAuth、session、API key 鉴权
src/lib/uploads/                 直接上传和 multipart 编排
src/components/ui/               shadcn/ui 基础组件
deploy/                          Nginx 部署示例
docs/                            GitHub Pages 中文文档站
```

<h2 id="api-surface">API 概览</h2>

后端接口使用 Next.js Route Handlers，位于 `src/app/api`。

| 模块           | 路由                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Auth           | `/api/auth/github/start`、`/api/auth/github/callback`、`/api/auth/logout`、`/api/me`                                              |
| 存储账号       | `/api/storage/accounts`、`/api/storage/accounts/:id`、`/api/storage/accounts/:id/check`、`/api/storage/accounts/:id/sync-buckets` |
| Buckets        | `/api/storage/buckets`、`/api/storage/buckets/:id`                                                                                |
| Files          | `/api/files`、`/api/files/folders`                                                                                                |
| API keys       | `/api/file-api-keys`、`/api/file-api-keys/:id`                                                                                    |
| Uploads        | `/api/uploads`、`/api/uploads/direct`、`/api/uploads/:id/parts/upload`、`/api/uploads/:id/complete`、`/api/uploads/:id/abort`     |
| Public uploads | `/api/public-uploads/:uuid`                                                                                                       |
| Backup         | `/api/admin/sql-backup`                                                                                                           |

应用内也提供 API 文档页面：`/api-docs`。

<details>
<summary>部署与迁移说明</summary>

### Docker Compose

`docker-compose.yml` 默认使用这个镜像：

```text
ghcr.io/zhihui-hu/onefile:latest
```

先创建 `.env`：

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 生产或迁移场景推荐设置。
# 留空时，Docker 中会生成 /app/data/.onefile-secret，
# 本地开发中会生成 ./data/.onefile-secret。
# APP_SECRET=replace_with_a_long_random_secret

# 可选。仅在反向代理无法正确转发
# Host、X-Forwarded-Proto、X-Forwarded-Host 时使用。
# APP_ORIGIN=https://onefile.example.com
```

启动服务：

```bash
docker compose pull
docker compose up -d
```

查看状态和日志：

```bash
docker compose ps
docker compose logs -f onefile
```

升级：

```bash
git pull
docker compose pull
docker compose up -d
```

### 数据位置

Docker 镜像中的 SQLite 数据文件位于：

```text
/app/data/onefile.sqlite
```

Compose 文件通过这个 volume 持久化：

```text
onefile-data
```

不要删除 `onefile-data`，除非你明确要移除用户、存储账号、API key、token 和上传状态。

### 应用密钥

OneFile 需要一个应用密钥，用于 session 签名和加密存储凭证。解析顺序如下：

1. `.env` 中的 `APP_SECRET`
2. 兼容旧版本的 `SESSION_SECRET` 和 `STORAGE_CREDENTIAL_ENCRYPTION_KEY`
3. 自动生成的 `/app/data/.onefile-secret`

单节点 Docker 使用时，可以留空 `APP_SECRET`，应用会把生成的密钥保存在 volume 中。迁移、多容器或重建 volume 时，请设置稳定的 `APP_SECRET`。

### SQL 导入导出

管理员可以从应用内导出 SQL 备份。导出的文件名包含密钥元数据，导入时应用会同步 `.onefile-secret`，迁移后的部署仍能解密已有存储凭证。

请保留原始导出文件名，不要手动重命名。

### 反向代理

生产环境建议在 OneFile 前面放 Nginx、Caddy、Traefik 或云负载均衡，并转发到：

```text
127.0.0.1:27507
```

如果代理没有正确转发 `Host`、`X-Forwarded-Proto` 和 `X-Forwarded-Host`，请设置：

```bash
APP_ORIGIN=https://onefile.example.com
```

### 本地构建镜像

```bash
docker build -t onefile .

docker run -d --name onefile \
  -p 27507:27507 \
  --env-file .env \
  -v onefile-data:/app/data \
  onefile
```

</details>

<details>
<summary>最小 API 上传示例</summary>

准备环境变量：

```bash
export ONEFILE_BASE_URL="https://onefile.example.com"
export ONEFILE_API_KEY="ofk_xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export FILE="./image.png"
```

通过直接上传 API 上传小文件或图片：

```bash
curl -fsS -X POST "$ONEFILE_BASE_URL/api/uploads/direct" \
  -H "Authorization: Bearer $ONEFILE_API_KEY" \
  -F "file=@$FILE"
```

也可以指定对象路径：

```bash
curl -fsS -X POST "$ONEFILE_BASE_URL/api/uploads/direct" \
  -H "Authorization: Bearer $ONEFILE_API_KEY" \
  -F "file=@$FILE" \
  -F "object_key=images/image.png" \
  -F "original_filename=image.png"
```

响应会包含 `bucket_id`、`bucket_name`、`object_key`、`mime_type`、`compressed` 等字段。大文件请先调用 `/api/uploads` 创建 multipart 会话，再把每个分片上传到 `/api/uploads/:id/parts/upload`，最后调用 `/api/uploads/:id/complete` 完成。完整接口说明见应用内 `/api-docs`。

</details>

<details>
<summary>本地开发</summary>

```bash
pnpm install
pnpm dev
```

开发地址：

```text
http://localhost:27507
```

本地 GitHub OAuth callback URL：

```text
http://localhost:27507/callback/auth
```

常用命令：

```bash
pnpm build
pnpm start
pnpm lint
```

</details>

<h2 id="license">许可证</h2>

OneFile 使用 [AGPL-3.0-only](./LICENSE) 许可证。

<h2 id="credits">致谢</h2>

- [Next.js](https://nextjs.org/)：React 全栈框架
- [shadcn/ui](https://ui.shadcn.com/)：UI 组件系统
- [Lucide](https://lucide.dev/)：图标库
- [TanStack Query](https://tanstack.com/query)：客户端数据请求和缓存
- [TanStack Table](https://tanstack.com/table)：数据表格 primitives
- [Drizzle ORM](https://orm.drizzle.team/)：TypeScript ORM
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)：SQLite driver
- [AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/)：S3 兼容存储接入
- [ali-oss](https://github.com/ali-sdk/ali-oss)：阿里云 OSS SDK
- [cos-nodejs-sdk-v5](https://github.com/tencentyun/cos-nodejs-sdk-v5)：腾讯云 COS SDK

<h2 id="security-notes">安全说明</h2>

OneFile 会保存对象存储访问凭证和 API key 元数据。生产环境中请保护好 `.env`、`/app/data/.onefile-secret` 和 SQLite 数据库。只要应用暴露到公网，就建议通过可信反向代理提供 HTTPS。
