'use client';

import {
  downloadSqlBackup,
  importSqlBackup,
} from '@/app/(main)/components/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileDown, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SqlBackupTab = 'export' | 'import';

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function SqlBackupDialog({
  open,
  onOpenChange,
  initialTab = 'export',
  canImport = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: SqlBackupTab;
  canImport?: boolean;
}) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SqlBackupTab>(initialTab);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTab(canImport ? initialTab : 'export');
    } else {
      setFileError(null);
    }
  }, [canImport, initialTab, open]);

  const exportMutation = useMutation({
    mutationFn: downloadSqlBackup,
    onSuccess: ({ blob, filename }) => {
      saveBlob(blob, filename);
      toast.success(
        canImport
          ? 'SQL 备份已导出，请保留原始文件名'
          : '账号相关 SQL 数据已导出',
      );
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : '导出失败'),
  });

  const importMutation = useMutation({
    mutationFn: importSqlBackup,
    onSuccess: async ({ app_secret_set: appSecretSet }) => {
      toast.success(
        appSecretSet ? 'SQL 备份已导入，APP_SECRET 已同步' : 'SQL 备份已导入',
      );
      setFileError(null);
      await queryClient.invalidateQueries({ queryKey: ['onefile'] });
      onOpenChange(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '导入失败';
      setFileError(message);
      toast.error(message);
    },
  });

  const pending = exportMutation.isPending || importMutation.isPending;
  const exportContent = (
    <FieldGroup>
      <Field>
        <FieldLabel>{canImport ? '导出 SQL' : '导出我的数据'}</FieldLabel>
        <FieldDescription>
          {canImport ? (
            <>
              生成 <code>&lt;APP_SECRET&gt;_yyyyMMddHHmmss.sql</code>
              ，包含 OneFile 数据表结构和数据。
            </>
          ) : (
            <>
              生成当前账号相关的 OneFile 数据表结构和数据，不包含其他用户记录。
            </>
          )}
        </FieldDescription>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => exportMutation.mutate()}
        >
          {exportMutation.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <FileDown data-icon="inline-start" />
          )}
          {canImport ? '导出 SQL' : '导出我的数据'}
        </Button>
      </Field>
    </FieldGroup>
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialog.Content
        className="overflow-hidden sm:max-w-lg"
        drawerClassName="max-h-[92dvh]"
      >
        <ResponsiveDialog.Header className="min-w-0 p-0 text-left">
          <ResponsiveDialog.Title>
            {canImport ? '导入导出' : '导出数据'}
          </ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            {canImport
              ? '导出当前 SQLite 数据为 SQL 文件，或导入 SQL 备份恢复数据。'
              : '导出当前账号相关的 SQL 数据。'}
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <div className="flex min-h-0 min-w-0 flex-col gap-5">
          {canImport && (
            <Alert>
              <TriangleAlert />
              <AlertTitle>导入会覆盖当前数据库</AlertTitle>
              <AlertDescription>
                导入前建议先导出一份备份。全量备份文件名包含 APP_SECRET 和
                yyyyMMddHHmmss
                时间，导入时会解析并同步到服务器；没有密钥信息的备份会直接导入数据。
              </AlertDescription>
            </Alert>
          )}

          {canImport ? (
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as SqlBackupTab)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="export">导出</TabsTrigger>
                <TabsTrigger value="import">导入</TabsTrigger>
              </TabsList>

              <TabsContent value="export" className="mt-4">
                {exportContent}
              </TabsContent>

              <TabsContent value="import" className="mt-4">
                <div className="flex flex-col gap-4">
                  <FieldGroup>
                    <Field data-invalid={Boolean(fileError)}>
                      <FieldLabel htmlFor="sql-backup-file">
                        导入 SQL
                      </FieldLabel>
                      <Input
                        id="sql-backup-file"
                        type="file"
                        accept=".sql,text/plain,application/sql"
                        aria-invalid={Boolean(fileError)}
                        disabled={pending}
                        onChange={(event) => {
                          const selectedFile = event.target.files?.[0] ?? null;
                          event.currentTarget.value = '';
                          setFileError(null);

                          if (!selectedFile) {
                            setFileError('请选择 SQL 备份文件');
                            return;
                          }

                          importMutation.mutate(selectedFile);
                        }}
                      />
                      <FieldDescription>
                        请选择 OneFile 导出的 `.sql`
                        备份文件，选择后会立即导入。全量备份会从
                        <code>&lt;APP_SECRET&gt;_yyyyMMddHHmmss.sql</code>
                        文件名同步 APP_SECRET；用户级备份可直接导入数据。
                      </FieldDescription>
                      <FieldError>{fileError}</FieldError>
                      {importMutation.isPending && (
                        <FieldDescription className="flex items-center gap-2">
                          <Spinner data-icon="inline-start" />
                          正在导入 SQL 备份
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldGroup>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            exportContent
          )}
        </div>
      </ResponsiveDialog.Content>
    </ResponsiveDialog>
  );
}
