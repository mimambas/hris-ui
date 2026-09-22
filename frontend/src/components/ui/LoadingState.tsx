export default function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="py-16 px-6 text-center" role="status" aria-live="polite">
      <div className="mx-auto w-12 h-12 rounded-full bg-surface-strong flex items-center justify-center mb-4">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm font-semibold text-muted">{message}</p>
    </div>
  );
}
