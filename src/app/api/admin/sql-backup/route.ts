import { HttpError, ok, withApiHandler } from '@/lib/api/response';
import { requireAdmin, requireUser } from '@/lib/auth/session';
import type { User } from '@/lib/db/schema';
import {
  createSqlBackup,
  restoreSqlBackup,
  validateSqlBackup,
} from '@/lib/db/sql-backup';
import { getEnv, setImportedAppSecret } from '@/lib/env';

export const runtime = 'nodejs';

const MAX_SQL_BACKUP_BYTES = 25 * 1024 * 1024;
const SAFE_SECRET_PATTERN = /^[A-Za-z0-9_-]+$/;
const SQL_BACKUP_FILENAME_PATTERN =
  /^(.+)_(?:\d{14}|\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.sql$/;

type SqlBackupPayload = {
  sqlText: string;
  appSecret: string | null;
};

function encodeSecretForFilename(secret: string) {
  if (SAFE_SECRET_PATTERN.test(secret)) {
    return secret;
  }

  return `b64-${Buffer.from(secret, 'utf8').toString('base64url')}`;
}

function decodeSecretFromFilename(value: string) {
  if (!value.startsWith('b64-')) {
    return value;
  }

  return Buffer.from(value.slice('b64-'.length), 'base64url').toString('utf8');
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

function backupTimestamp(date = new Date()) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
    padDatePart(date.getHours()),
    padDatePart(date.getMinutes()),
    padDatePart(date.getSeconds()),
  ].join('');
}

function safeFilenamePart(value: string) {
  const cleaned = value
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return cleaned.slice(0, 48) || 'user';
}

function backupFilename(user: User, fullBackup: boolean) {
  if (!fullBackup) {
    return `onefile-user-${user.id}-${safeFilenamePart(user.username)}-${backupTimestamp()}.sql`;
  }

  return `${encodeSecretForFilename(getEnv().appSecret)}_${backupTimestamp()}.sql`;
}

function contentDispositionFilename(filename: string) {
  return filename.replace(/["\\\r\n]/g, '_');
}

function parseAppSecretFromFilename(filename: string) {
  const name = filename.split(/[/\\]/).pop() ?? '';
  const match = name.match(SQL_BACKUP_FILENAME_PATTERN);
  if (!match?.[1]) {
    return null;
  }

  try {
    const appSecret = decodeSecretFromFilename(match[1]).trim();
    return appSecret || null;
  } catch {
    return null;
  }
}

async function readSqlBackup(request: Request): Promise<SqlBackupPayload> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      throw new HttpError(400, 'BAD_REQUEST', '请选择要导入的 SQL 文件');
    }

    if (file.size > MAX_SQL_BACKUP_BYTES) {
      throw new HttpError(400, 'BAD_REQUEST', 'SQL 文件不能超过 25 MiB');
    }

    return {
      sqlText: await file.text(),
      appSecret: parseAppSecretFromFilename(file.name),
    };
  }

  const sqlText = await request.text();
  if (Buffer.byteLength(sqlText, 'utf8') > MAX_SQL_BACKUP_BYTES) {
    throw new HttpError(400, 'BAD_REQUEST', 'SQL 内容不能超过 25 MiB');
  }

  return {
    sqlText,
    appSecret: request.headers.get('x-onefile-app-secret')?.trim() || null,
  };
}

export async function GET() {
  return withApiHandler(async () => {
    const user = await requireUser();
    const fullBackup = user.role === 'admin';
    const sqlText = createSqlBackup(fullBackup ? {} : { userId: user.id });

    return new Response(sqlText, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${contentDispositionFilename(backupFilename(user, fullBackup))}"`,
        'Content-Type': 'application/sql; charset=utf-8',
        'X-OneFile-Backup-Scope': fullBackup ? 'full' : 'user',
      },
    });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    await requireAdmin();
    const { sqlText, appSecret } = await readSqlBackup(request);

    if (!sqlText.trim()) {
      throw new HttpError(400, 'BAD_REQUEST', 'SQL 文件内容为空');
    }

    try {
      validateSqlBackup(sqlText);
    } catch (error) {
      throw new HttpError(
        400,
        'BAD_REQUEST',
        error instanceof Error ? error.message : 'SQL 备份校验失败',
      );
    }

    try {
      restoreSqlBackup(sqlText);
    } catch (error) {
      throw new HttpError(
        400,
        'BAD_REQUEST',
        error instanceof Error ? error.message : 'SQL 导入失败',
      );
    }

    if (appSecret) {
      try {
        setImportedAppSecret(appSecret);
      } catch (error) {
        throw new HttpError(
          400,
          'BAD_REQUEST',
          error instanceof Error ? error.message : 'APP_SECRET 设置失败',
        );
      }
    }

    return ok({ imported: true, app_secret_set: Boolean(appSecret) });
  });
}
