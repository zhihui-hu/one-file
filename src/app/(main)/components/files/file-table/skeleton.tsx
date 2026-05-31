import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function FileTableSkeleton() {
  const colClasses = [
    'w-8 text-center',
    'w-72 xl:w-96',
    'w-20',
    'w-24 text-right',
    'w-36 xl:w-40',
    'w-10',
  ] as const;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="hidden shrink-0 lg:block">
        <table className="min-w-[680px] w-full table-fixed text-sm">
          <thead className="[&_th]:bg-background">
            <tr className="border-b">
              {(['', '名称', '类型', '大小', '修改日期', ''] as const).map(
                (label, i) => (
                  <th
                    key={i}
                    className={cn(
                      'h-8 border-b px-2 py-1 text-left align-middle font-medium text-foreground',
                      colClasses[i],
                    )}
                  >
                    {label ? <Skeleton className="h-3 w-14" /> : null}
                  </th>
                ),
              )}
            </tr>
          </thead>
        </table>
      </div>
      <div className="hidden min-h-0 flex-1 overflow-y-auto lg:block">
        <table className="min-w-[680px] w-full table-fixed text-sm">
          <tbody>
            {Array.from({ length: 12 }).map((_, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className={cn('h-9 px-2 py-1 align-middle', colClasses[0])}>
                  <Skeleton className="mx-auto size-4 rounded-sm" />
                </td>
                <td className={cn('h-9 px-2 py-1 align-middle', colClasses[1])}>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-7" />
                    <Skeleton className="h-4 w-52 max-w-[60vw]" />
                  </div>
                </td>
                <td className={cn('h-9 px-2 py-1 align-middle', colClasses[2])}>
                  <Skeleton className="h-4 w-10" />
                </td>
                <td
                  className={cn(
                    'h-9 px-2 py-1 align-middle text-right',
                    colClasses[3],
                  )}
                >
                  <Skeleton className="ml-auto h-4 w-14" />
                </td>
                <td className={cn('h-9 px-2 py-1 align-middle', colClasses[4])}>
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className={cn('h-9 px-2 py-1 align-middle', colClasses[5])}>
                  <Skeleton className="ml-auto size-7 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2 lg:hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-2.5">
            <div className="flex min-w-0 items-start gap-2">
              <Skeleton className="mt-1 size-4 shrink-0 rounded-sm" />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2 px-1">
                  <Skeleton className="size-7 shrink-0 rounded-md" />
                  <Skeleton className="h-4 min-w-0 flex-1" />
                </div>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 px-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-24 max-w-[45%]" />
                </div>
              </div>
              <Skeleton className="size-7 shrink-0 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
