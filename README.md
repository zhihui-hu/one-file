<p align="center">
  <img src="https://img.huzhihui.com/uploads/2026/05/pwa-512x512.png" width="112" height="112" alt="OneFile Logo" />
</p>

<h1 align="center">OneFile</h1>

<p align="center">
  A lightweight, self-hosted upload and object-storage management platform.
  <br />
  One web app and one API-key system for S3, R2, B2, OCI, Aliyun OSS, and Tencent COS.
</p>

<p align="center">
  <a href="https://onefile.huzhihui.com">Live Demo</a>
  ·
  <a href="https://zhihui-hu.github.io/onefile/">Documentation</a>
  ·
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="#image-hosting-integration">Image Hosting Integration</a>
  ·
  <a href="#supported-storage-providers">Storage Providers</a>
  ·
  <a href="#license">License</a>
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

OneFile is a compact object-storage upload console for self-hosted image hosting, file drop pages, and multi-cloud bucket management. It connects AWS S3, Cloudflare R2, Backblaze B2, Oracle Object Storage, Aliyun OSS, and Tencent COS behind one interface. Users can upload and manage files from the browser, while external tools can upload through scoped API keys.

## Features

| Capability                       | Description                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Multi-cloud storage management   | Manage storage accounts, buckets, public base URLs, and upload policies in one console.                        |
| Browser upload and file browsing | Upload files, browse folders, search objects, preview images, copy links, and delete objects.                  |
| API-key uploads                  | Give image hosting apps, Markdown editors, scripts, CI jobs, and third-party systems one upload endpoint.      |
| Public upload pages              | Generate shareable upload pages with QR codes without exposing admin accounts or raw API keys.                 |
| Image compression                | API uploads and public upload pages can convert images to WebP for blogs, forums, and documentation workflows. |
| Large-file uploads               | Multipart upload endpoints handle create, part upload, completion, and abort flows.                            |
| Lightweight deployment           | SQLite by default, Docker-ready, and designed for single-node self-hosting.                                    |
| Backup and migration             | Export and import SQL backups, including secret metadata needed to decrypt stored credentials after migration. |
| Automatic bucket selection       | If an API key is not bound to one bucket, OneFile can select an available bucket for the user.                 |

## Product Preview

The app is organized around storage accounts, buckets, files, API keys, and public upload links.

<table>
  <tr>
    <td width="50%">
      <strong>File management</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-1.png" alt="OneFile file management screenshot" />
    </td>
    <td width="50%">
      <strong>Storage configuration</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-2.png" alt="OneFile storage configuration screenshot" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <strong>API keys and upload policies</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-3.png" alt="OneFile API key screenshot" />
    </td>
    <td width="50%">
      <strong>Public upload page</strong>
      <br />
      <img src="https://img.huzhihui.com/uploads/2026/05/onefile-4.png" alt="OneFile public upload page screenshot" />
    </td>
  </tr>
</table>

## Why OneFile

- **SQLite-first and small**: no MySQL, PostgreSQL, or Redis required for the default deployment.
- **Easy migration**: export SQL backups from the admin UI and import them in a new environment.
- **Fast image-hosting integration**: generate an API key and upload with `Authorization: Bearer ...`.
- **Uploads stay manageable**: files uploaded through external tools can still be browsed, copied, previewed, and deleted in the console.
- **Image compression built in**: optional WebP compression is useful for Markdown, blog, forum, and documentation images.
- **Multi-bucket workflow**: API keys can target a fixed bucket or let OneFile choose from available buckets.
- **Multi-provider abstraction**: S3-compatible storage, OCI, Aliyun OSS, and Tencent COS share one internal adapter interface.
- **Server-side storage writes**: browsers and external tools only talk to OneFile; authentication, compression, bucket selection, and object writes are handled server-side.

## Use Cases

- Self-hosted image hosting
- Markdown, blog, and forum image uploads
- A unified upload API for external tools
- Managing several object-storage accounts and buckets
- Lightweight public file drop pages
- CI artifact, backup, and media uploads

## Supported Storage Providers

| Provider              | Integration                                         |
| --------------------- | --------------------------------------------------- |
| AWS S3                | Standard S3 API                                     |
| Cloudflare R2         | S3-compatible API                                   |
| Backblaze B2          | S3-compatible API                                   |
| Oracle Object Storage | OCI Object Storage API, with S3-compatible fallback |
| Aliyun OSS            | Aliyun OSS SDK                                      |
| Tencent COS           | Tencent COS SDK                                     |

## Architecture

```mermaid
flowchart LR
  user["Signed-in user / Admin console"]
  tools["Image host / Markdown editor / Script / CI"]
  public["Public upload link / QR code"]

  app["OneFile<br/>Next.js app"]
  auth["GitHub OAuth<br/>Session / API key"]
  db["SQLite<br/>Users, accounts, buckets, API keys, upload state"]
  backup["SQL import/export<br/>Backup and migration"]

  scheduler["Upload orchestration<br/>Compression / bucket selection"]
  single["Direct Upload API<br/>Small files / image compression"]
  multipart["Multipart Upload API<br/>Server-side multipart flow"]

  storage["Object storage<br/>S3 / R2 / B2 / OCI / OSS / COS"]

  user --> app
  tools -->|"Bearer API key"| app
  public -->|"UUID upload page"| app

  app --> auth
  app <--> db
  db <--> backup
  app --> scheduler

  scheduler --> single
  scheduler --> multipart
  single --> storage
  multipart --> storage

  app -->|"Browse / delete / copy links"| storage
```

## Quick Start

The fastest way to run OneFile is the GHCR image. The default service port is `27507`, and persistent data is stored in the Docker volume `onefile-data`.

1. Create a GitHub OAuth App and set the callback URL:

   ```text
   https://[domain-or-ip:port]/callback/auth
   ```

2. Run the container:

   ```bash
   docker run -d --name onefile --restart unless-stopped \
     -p 27507:27507 \
     -e GITHUB_CLIENT_ID=your_github_client_id \
     -e GITHUB_CLIENT_SECRET=your_github_client_secret \
     -v onefile-data:/app/data \
     ghcr.io/zhihui-hu/onefile:latest
   ```

3. Open the app:

   ```text
   http://[domain-or-ip:port]
   ```

4. After login:
   - Add an object-storage account.
   - Sync buckets.
   - Configure each bucket's public base URL.
   - Create an API key.
   - Use the API key from image hosts, scripts, editors, or upload tools.

## Image Hosting Integration

OneFile API keys are designed for external upload workflows. Create an API key in the app, then send it in the request header:

```text
Authorization: Bearer ofk_xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

There are two common integration paths:

- **API upload**: for image-hosting apps, Markdown editors, scripts, CI jobs, and third-party systems.
- **Public upload page**: for a shareable browser page where visitors can upload without seeing the raw API key.

Uploaded images remain manageable in OneFile. If image compression is enabled, supported images are converted to WebP. If the API key is not pinned to a bucket, OneFile selects an available bucket for the current user.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide React
- **Client data and tables**: TanStack Query v5, TanStack Table v8
- **Backend**: Next.js Route Handlers running on Node.js
- **Database**: Drizzle ORM with `better-sqlite3`
- **Storage**: AWS SDK for S3-compatible providers, Aliyun OSS SDK, Tencent COS SDK, OCI adapter
- **Deployment**: Docker / Docker Compose with `ghcr.io/zhihui-hu/onefile:latest`

## Project Structure

```text
src/app/                         Next.js App Router pages and API routes
src/app/api/**/route.ts          Node.js backend endpoints
src/app/(main)/components/       Main file-management console
src/app/[uuid]/                  Public upload pages
src/app/api-docs/                In-app API documentation
src/lib/db/                      SQLite client, Drizzle schema, SQL backup helpers
src/lib/storage/                 Storage provider adapters and shared types
src/lib/auth/                    GitHub OAuth, sessions, and API-key auth
src/lib/uploads/                 Direct upload and multipart orchestration
src/components/ui/               shadcn/ui primitives
deploy/                          Nginx deployment sample
docs/                            GitHub Pages documentation site
```

## API Surface

The backend is implemented with Next.js Route Handlers under `src/app/api`.

| Area             | Routes                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Auth             | `/api/auth/github/start`, `/api/auth/github/callback`, `/api/auth/logout`, `/api/me`                                              |
| Storage accounts | `/api/storage/accounts`, `/api/storage/accounts/:id`, `/api/storage/accounts/:id/check`, `/api/storage/accounts/:id/sync-buckets` |
| Buckets          | `/api/storage/buckets`, `/api/storage/buckets/:id`                                                                                |
| Files            | `/api/files`, `/api/files/folders`                                                                                                |
| API keys         | `/api/file-api-keys`, `/api/file-api-keys/:id`                                                                                    |
| Uploads          | `/api/uploads`, `/api/uploads/direct`, `/api/uploads/:id/parts/upload`, `/api/uploads/:id/complete`, `/api/uploads/:id/abort`     |
| Public uploads   | `/api/public-uploads/:uuid`                                                                                                       |
| Backup           | `/api/admin/sql-backup`                                                                                                           |

The app also includes in-product API documentation at `/api-docs`.

<details>
<summary>Deployment and migration notes</summary>

### Docker Compose

`docker-compose.yml` uses this image by default:

```text
ghcr.io/zhihui-hu/onefile:latest
```

Create `.env` first:

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Optional but recommended for production or migration.
# If empty, OneFile generates /app/data/.onefile-secret in Docker
# or ./data/.onefile-secret in local development.
# APP_SECRET=replace_with_a_long_random_secret

# Optional. Use only when your reverse proxy cannot forward
# Host, X-Forwarded-Proto, and X-Forwarded-Host correctly.
# APP_ORIGIN=https://onefile.example.com
```

Start the service:

```bash
docker compose pull
docker compose up -d
```

Check status and logs:

```bash
docker compose ps
docker compose logs -f onefile
```

Upgrade:

```bash
git pull
docker compose pull
docker compose up -d
```

### Data location

The Docker image stores SQLite data at:

```text
/app/data/onefile.sqlite
```

The compose file persists it through:

```text
onefile-data
```

Do not delete `onefile-data` unless you intentionally want to remove users, storage accounts, API keys, tokens, and upload state.

### Application secret

OneFile needs one application secret for session signing and encrypted storage credentials. Resolution order:

1. `APP_SECRET` from `.env`
2. Legacy compatibility values: `SESSION_SECRET` and `STORAGE_CREDENTIAL_ENCRYPTION_KEY`
3. Auto-generated `/app/data/.onefile-secret`

For single-node Docker usage, leaving `APP_SECRET` empty is acceptable because the app stores a generated secret in the volume. For migration, multi-container setups, or volume rebuilds, set a stable `APP_SECRET`.

### SQL import and export

Administrators can export SQL backups from the app. Exported filenames include secret metadata, and importing the backup lets the app sync `.onefile-secret`, so migrated deployments can still decrypt existing storage credentials.

Keep the original exported filename. Do not rename it manually.

### Reverse proxy

In production, put Nginx, Caddy, Traefik, or a cloud load balancer in front of:

```text
127.0.0.1:27507
```

If the proxy does not forward `Host`, `X-Forwarded-Proto`, and `X-Forwarded-Host` correctly, set:

```bash
APP_ORIGIN=https://onefile.example.com
```

### Local image build

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
<summary>Minimal API upload example</summary>

Prepare environment variables:

```bash
export ONEFILE_BASE_URL="https://onefile.example.com"
export ONEFILE_API_KEY="ofk_xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export FILE="./image.png"
```

Upload a small file or image through the direct upload API:

```bash
curl -fsS -X POST "$ONEFILE_BASE_URL/api/uploads/direct" \
  -H "Authorization: Bearer $ONEFILE_API_KEY" \
  -F "file=@$FILE"
```

Optionally provide a custom object key:

```bash
curl -fsS -X POST "$ONEFILE_BASE_URL/api/uploads/direct" \
  -H "Authorization: Bearer $ONEFILE_API_KEY" \
  -F "file=@$FILE" \
  -F "object_key=images/image.png" \
  -F "original_filename=image.png"
```

The response includes fields such as `bucket_id`, `bucket_name`, `object_key`, `mime_type`, and `compressed`. For large files, create a multipart session with `/api/uploads`, upload each part to `/api/uploads/:id/parts/upload`, then complete with `/api/uploads/:id/complete`. See `/api-docs` inside the app for the full API reference.

</details>

<details>
<summary>Local development</summary>

```bash
pnpm install
pnpm dev
```

Development URL:

```text
http://localhost:27507
```

Local GitHub OAuth callback URL:

```text
http://localhost:27507/callback/auth
```

Common commands:

```bash
pnpm build
pnpm start
pnpm lint
```

</details>

## License

OneFile is licensed under [AGPL-3.0-only](./LICENSE).

## Credits

- [Next.js](https://nextjs.org/) - React full-stack framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component system
- [Lucide](https://lucide.dev/) - Icon library
- [TanStack Query](https://tanstack.com/query) - Client-side data fetching and caching
- [TanStack Table](https://tanstack.com/table) - Data table primitives
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite driver
- [AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/) - S3-compatible storage integration
- [ali-oss](https://github.com/ali-sdk/ali-oss) - Aliyun OSS SDK
- [cos-nodejs-sdk-v5](https://github.com/tencentyun/cos-nodejs-sdk-v5) - Tencent COS SDK

## Security Notes

OneFile stores object-storage access credentials and API-key metadata. In production, protect `.env`, `/app/data/.onefile-secret`, and the SQLite database. Serve the app over HTTPS through a trusted reverse proxy whenever it is exposed to the internet.
