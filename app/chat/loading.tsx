export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-180px)] flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 animate-pulse rounded bg-[#1A1A2E]" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-[#1A1A2E]" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-[#1A1A2E]" />
        <div className="ml-auto h-16 w-2/3 animate-pulse rounded-2xl bg-[#1A1A2E]" />
      </div>
      <div className="h-11 animate-pulse rounded-full bg-[#1A1A2E]" />
    </div>
  );
}
