import { HttpError, ok, parseJson, withApiHandler } from '@/lib/api/response';
import { getAuthContext } from '@/lib/auth/api-keys';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db/client';
import { storageAccounts, storageBuckets } from '@/lib/db/schema';
import {
  adapterFromAccountForBucketConfig,
  getStorageAccountForUser,
  publicStorageBucket,
} from '@/lib/storage-config';
import {
  defaultBucketPublicUrl,
  defaultStorageEndpoint,
  optionalStorageString,
} from '@/lib/storage/endpoints';
import { asc, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const createSchema = z.object({
  storage_account_id: z.union([z.number().int(), z.string().min(1)]),
  name: z.string().trim().min(1).max(255),
  region: z.string().trim().max(120).nullable().optional(),
  endpoint: z.string().trim().max(240).nullable().optional(),
  key_prefix: z.string().trim().max(400).nullable().optional(),
  public_base_url: z.string().url().nullable().optional(),
  visibility: z.enum(['private', 'public']).optional(),
});

function parseStorageAccountId(value: number | string) {
  const accountId = Number(value);
  if (!Number.isInteger(accountId) || accountId <= 0) {
    throw new HttpError(400, 'BAD_REQUEST', 'Invalid storage_account_id');
  }
  return accountId;
}

function firstString(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = optionalStorageString(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const auth = await getAuthContext(request, ['files:read']);
    const rows = await db
      .select({ bucket: storageBuckets, account: storageAccounts })
      .from(storageBuckets)
      .innerJoin(
        storageAccounts,
        eq(storageBuckets.storageAccountId, storageAccounts.id),
      )
      .where(eq(storageBuckets.userId, auth.user.id))
      .orderBy(asc(storageAccounts.name), asc(storageBuckets.name));

    return ok({
      items: rows.map((row) => publicStorageBucket(row.bucket, row.account)),
    });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const payload = await parseJson(request, createSchema);
    const account = await getStorageAccountForUser(
      user.id,
      parseStorageAccountId(payload.storage_account_id),
    );
    const now = new Date().toISOString();
    const region = firstString(payload.region, account.region);
    const endpoint = firstString(
      payload.endpoint,
      account.endpoint,
      defaultStorageEndpoint({
        provider: account.provider,
        region,
        accountId: account.providerAccountId,
      }),
    );
    const publicBaseUrl =
      optionalStorageString(payload.public_base_url) ??
      defaultBucketPublicUrl({
        provider: account.provider,
        bucketName: payload.name,
        region,
        endpoint,
        accountId: account.providerAccountId,
        namespace: account.namespace,
      });
    const keyPrefix = optionalStorageString(payload.key_prefix)
      ?.replace(/^\/+|\/+$/g, '')
      .trim();
    const adapter = adapterFromAccountForBucketConfig(account, {
      region,
      endpoint,
    });
    const check = await adapter.checkCredentials({
      bucket: payload.name,
      region: region ?? undefined,
    });

    if (!check.ok) {
      throw new HttpError(
        400,
        'PROVIDER_ERROR',
        `bucket 校验失败：${check.error?.message ?? '请检查 Bucket、Access key、Secret key、Region 和 Endpoint。'}`,
        check.error,
      );
    }

    const [bucket] = await db
      .insert(storageBuckets)
      .values({
        userId: user.id,
        storageAccountId: account.id,
        name: payload.name,
        region,
        endpoint,
        keyPrefix: keyPrefix ?? '',
        publicBaseUrl,
        visibility: payload.visibility ?? 'private',
        lastCheckedAt: now,
        lastError: null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          storageBuckets.userId,
          storageBuckets.storageAccountId,
          storageBuckets.name,
        ],
        set: {
          region,
          endpoint,
          keyPrefix: keyPrefix ?? '',
          publicBaseUrl,
          visibility: payload.visibility ?? 'private',
          lastCheckedAt: now,
          lastError: null,
          updatedAt: now,
        },
      })
      .returning();

    if (!bucket) {
      throw new HttpError(500, 'INTERNAL_ERROR', 'Storage bucket not created');
    }

    return ok(
      { bucket: publicStorageBucket(bucket, account) },
      { status: 201 },
    );
  });
}
