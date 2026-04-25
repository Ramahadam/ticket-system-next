'use client';

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      {error.digest && (
        <p className="font-mono text-sm text-muted-foreground">
          Digest: {error.digest}
        </p>
      )}
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || 'A server error occurred.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
      >
        Try again
      </button>
    </div>
  );
}
