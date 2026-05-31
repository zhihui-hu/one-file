'use client';

import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';

import type { FileSelectionBarProps } from './types';

export function FileSelectionBar({
  deleting,
  selectedFiles,
  onClearSelection,
  onOpenBulkDelete,
}: FileSelectionBarProps) {
  if (selectedFiles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 sm:bottom-4 sm:px-4">
      <div className="pointer-events-auto flex w-full max-w-md flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-2 shadow-lg sm:w-auto sm:justify-center sm:gap-3">
        <span className="min-w-0 flex-1 truncate px-1 text-sm text-muted-foreground sm:flex-none sm:px-2">
          已选择 {selectedFiles.length} 个文件
        </span>
        <Button size="sm" variant="outline" onClick={onClearSelection}>
          <X data-icon="inline-start" />
          取消
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={deleting}
          onClick={onOpenBulkDelete}
        >
          <Trash2 data-icon="inline-start" />
          删除
        </Button>
      </div>
    </div>
  );
}
