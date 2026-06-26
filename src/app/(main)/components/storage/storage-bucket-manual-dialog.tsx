'use client';

import type { StorageAccount } from '@/app/(main)/components/types';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';

const httpUrlMessage = '请输入合法的 HTTP/HTTPS URL。';

function isHttpUrlOrEmpty(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const manualBucketFormSchema = z.object({
  name: z.string().trim().min(1, '请输入 bucket 名称。').max(255),
  region: z.string().trim().max(120),
  endpoint: z.string().trim().max(240).refine(isHttpUrlOrEmpty, httpUrlMessage),
  key_prefix: z.string().trim().max(400),
  public_base_url: z.string().trim().refine(isHttpUrlOrEmpty, httpUrlMessage),
});

export type ManualBucketForm = z.infer<typeof manualBucketFormSchema>;

function emptyManualBucketForm(
  account: StorageAccount | null,
): ManualBucketForm {
  return {
    name: '',
    region: account?.region || '',
    endpoint: account?.endpoint || '',
    key_prefix: '',
    public_base_url: '',
  };
}

export function buildManualBucketPayload(
  values: ManualBucketForm,
  account: StorageAccount,
) {
  return {
    storage_account_id: account.id,
    name: values.name,
    region: values.region || null,
    endpoint: values.endpoint || null,
    key_prefix: values.key_prefix || null,
    public_base_url: values.public_base_url || null,
  };
}

export function StorageBucketManualDialog({
  open,
  onOpenChange,
  account,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: StorageAccount | null;
  pending: boolean;
  onSubmit: (values: ManualBucketForm) => void;
}) {
  const form = useForm<ManualBucketForm>({
    resolver: standardSchemaResolver(manualBucketFormSchema),
    defaultValues: emptyManualBucketForm(account),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(emptyManualBucketForm(account));
  }, [account, form, open]);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialog.Content
        className="overflow-hidden sm:max-w-md"
        drawerClassName="max-h-[92dvh]"
      >
        <ResponsiveDialog.Header className="min-w-0 p-0 text-left">
          <ResponsiveDialog.Title>添加 bucket</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            {account?.name
              ? `绑定 ${account.name} 下的 bucket。`
              : '绑定 bucket。'}
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form
          className="flex min-h-0 min-w-0 max-w-full flex-col gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Field
              className="min-w-0"
              data-invalid={Boolean(form.formState.errors.name)}
            >
              <FieldLabel htmlFor="manual-bucket-name">Bucket</FieldLabel>
              <Input
                id="manual-bucket-name"
                aria-invalid={Boolean(form.formState.errors.name)}
                placeholder="my-bucket"
                {...form.register('name')}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Field
                className="min-w-0"
                data-invalid={Boolean(form.formState.errors.region)}
              >
                <FieldLabel htmlFor="manual-bucket-region">Region</FieldLabel>
                <Input
                  id="manual-bucket-region"
                  aria-invalid={Boolean(form.formState.errors.region)}
                  placeholder="auto"
                  {...form.register('region')}
                />
                <FieldError errors={[form.formState.errors.region]} />
              </Field>
              <Field
                className="min-w-0"
                data-invalid={Boolean(form.formState.errors.key_prefix)}
              >
                <FieldLabel htmlFor="manual-bucket-prefix">
                  Key Prefix
                </FieldLabel>
                <Input
                  id="manual-bucket-prefix"
                  aria-invalid={Boolean(form.formState.errors.key_prefix)}
                  placeholder="uploads"
                  {...form.register('key_prefix')}
                />
                <FieldError errors={[form.formState.errors.key_prefix]} />
              </Field>
            </div>

            <Field
              className="min-w-0"
              data-invalid={Boolean(form.formState.errors.endpoint)}
            >
              <FieldLabel htmlFor="manual-bucket-endpoint">Endpoint</FieldLabel>
              <Input
                id="manual-bucket-endpoint"
                aria-invalid={Boolean(form.formState.errors.endpoint)}
                placeholder="https://..."
                {...form.register('endpoint')}
              />
              <FieldDescription>留空使用账号 Endpoint。</FieldDescription>
              <FieldError errors={[form.formState.errors.endpoint]} />
            </Field>

            <Field
              className="min-w-0"
              data-invalid={Boolean(form.formState.errors.public_base_url)}
            >
              <FieldLabel htmlFor="manual-bucket-public-url">
                Public URL
              </FieldLabel>
              <Input
                id="manual-bucket-public-url"
                type="url"
                aria-invalid={Boolean(form.formState.errors.public_base_url)}
                placeholder="https://cdn.example.com"
                {...form.register('public_base_url')}
              />
              <FieldDescription>留空时按存储类型自动推导。</FieldDescription>
              <FieldError errors={[form.formState.errors.public_base_url]} />
            </Field>
          </FieldGroup>

          <Separator />

          <ResponsiveDialog.Footer className="p-3">
            <Button type="submit" size="sm" disabled={pending || !account}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              添加
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog.Content>
    </ResponsiveDialog>
  );
}
