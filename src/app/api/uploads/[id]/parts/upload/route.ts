import { HttpError, ok, withApiHandler } from '@/lib/api/response';
import { getAuthContext } from '@/lib/auth/api-keys';
import { db } from '@/lib/db/client';
import { fileUploadParts, fileUploads } from '@/lib/db/schema';
import {
  adapterFromAccountForBucket,
  getStorageBucketForUser,
} from '@/lib/storage-config';
import { and, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';

export const runtime = 'nodejs';

function assertUploadCanReceiveParts(upload: typeof fileUploads.$inferSelect) {
  if (upload.status === 'completed') {
    throw new HttpError(409, 'CONFLICT', 'Upload already completed');
  }
  if (upload.status === 'aborted') {
    throw new HttpError(409, 'CONFLICT', 'Upload already aborted');
  }
  if (upload.status === 'failed') {
    throw new HttpError(409, 'CONFLICT', 'Upload already failed');
  }
  if (
    upload.status === 'expired' ||
    Date.parse(upload.expiresAt) <= Date.now()
  ) {
    throw new HttpError(410, 'UPLOAD_EXPIRED', 'Upload session expired');
  }
}

type PartRequestBody = {
  partNumber: number;
  contentLength: number;
  buffer?: Buffer;
  stream?: ReadableStream<Uint8Array>;
};

function parsePartNumber(value: string | null) {
  const partNumber = value ? Number.parseInt(value, 10) : NaN;
  if (!Number.isInteger(partNumber) || partNumber <= 0 || partNumber > 10000) {
    throw new HttpError(400, 'BAD_REQUEST', 'Invalid part_number');
  }
  return partNumber;
}

async function readPartRequest(request: NextRequest): Promise<PartRequestBody> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (contentType.startsWith('application/octet-stream')) {
    const contentLength = Number.parseInt(
      request.headers.get('content-length') ?? '',
      10,
    );
    if (!Number.isSafeInteger(contentLength) || contentLength <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'Invalid Content-Length');
    }
    if (!request.body) {
      throw new HttpError(400, 'BAD_REQUEST', 'Missing chunk body');
    }
    return {
      partNumber: parsePartNumber(
        request.nextUrl.searchParams.get('part_number'),
      ),
      contentLength,
      stream: request.body,
    };
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    throw new HttpError(400, 'BAD_REQUEST', 'Invalid form data');
  }
  const partNumberValue = formData.get('part_number');
  const chunk = formData.get('chunk');
  if (typeof partNumberValue !== 'string') {
    throw new HttpError(400, 'BAD_REQUEST', 'Missing or invalid part_number');
  }
  if (!(chunk instanceof Blob)) {
    throw new HttpError(400, 'BAD_REQUEST', 'Missing or invalid chunk file');
  }
  return {
    partNumber: parsePartNumber(partNumberValue),
    contentLength: chunk.size,
    buffer: Buffer.from(await chunk.arrayBuffer()),
  };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withApiHandler(async () => {
    const auth = await getAuthContext(request, ['uploads:write']);
    const { id } = await context.params;

    const partRequest = await readPartRequest(request);
    const partNumber = partRequest.partNumber;

    const [upload] = await db
      .select()
      .from(fileUploads)
      .where(and(eq(fileUploads.id, id), eq(fileUploads.userId, auth.user.id)))
      .limit(1);

    if (
      !upload ||
      upload.uploadMode !== 'multipart' ||
      !upload.providerUploadId
    ) {
      throw new HttpError(404, 'NOT_FOUND', 'Multipart upload not found');
    }
    assertUploadCanReceiveParts(upload);

    const [part] = await db
      .select()
      .from(fileUploadParts)
      .where(
        and(
          eq(fileUploadParts.uploadId, upload.id),
          eq(fileUploadParts.partNumber, partNumber),
        ),
      )
      .limit(1);

    if (!part) {
      throw new HttpError(400, 'BAD_REQUEST', 'Invalid part_number');
    }
    if (partRequest.contentLength !== part.partSize) {
      throw new HttpError(
        400,
        'BAD_REQUEST',
        'content_length does not match the expected part size',
        {
          expected_content_length: part.partSize,
          part_number: part.partNumber,
        },
      );
    }

    const { bucket, account } = await getStorageBucketForUser(
      auth.user.id,
      upload.bucketId,
    );
    const adapter = adapterFromAccountForBucket(account, bucket);

    await db
      .update(fileUploadParts)
      .set({ status: 'pending', updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(fileUploadParts.uploadId, upload.id),
          eq(fileUploadParts.partNumber, partNumber),
        ),
      );

    await db
      .update(fileUploads)
      .set({ status: 'uploading', updatedAt: new Date().toISOString() })
      .where(eq(fileUploads.id, upload.id));

    const commonInput = {
      bucket: bucket.name,
      region: bucket.region ?? undefined,
      key: upload.objectKey,
      uploadId: upload.providerUploadId,
      partNumber,
      contentLength: partRequest.contentLength,
    };
    const result =
      partRequest.stream && adapter.uploadPartStream
        ? await adapter.uploadPartStream({
            ...commonInput,
            body: Readable.fromWeb(
              partRequest.stream as NodeReadableStream<Uint8Array>,
            ),
          })
        : await adapter.uploadPart({
            ...commonInput,
            body:
              partRequest.buffer ??
              Buffer.from(await new Response(partRequest.stream).arrayBuffer()),
          });

    return ok({
      part_number: result.partNumber,
      etag: result.etag,
    });
  });
}
