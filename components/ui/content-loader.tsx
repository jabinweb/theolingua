/** Compact in-content loader for pages already wrapped by admin/dashboard shells. */
export function ContentLoader({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-theo-black border-t-transparent" />
      {message ? <p className="text-sm text-gray-500">{message}</p> : null}
    </div>
  );
}
