import { cn } from '@/lib/utils';

function splitPathSuffix(path: string) {
  const lastSlashIndex = path.lastIndexOf('/');
  const nameStartIndex = lastSlashIndex + 1;
  const fileName = path.slice(nameStartIndex);
  const dotIndex = fileName.lastIndexOf('.');

  if (dotIndex <= 0) {
    return { name: path, suffix: '' };
  }

  return {
    name: path.slice(0, nameStartIndex + dotIndex),
    suffix: fileName.slice(dotIndex),
  };
}

export function FilePathText({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const pathParts = splitPathSuffix(path);

  return (
    <span
      className={cn(
        'flex max-w-full min-w-0 items-end overflow-hidden',
        className,
      )}
    >
      <span className="line-clamp-2 min-w-0 flex-1 break-all">
        {pathParts.name}
      </span>
      {pathParts.suffix && (
        <span className="shrink-0 break-normal">{pathParts.suffix}</span>
      )}
    </span>
  );
}
