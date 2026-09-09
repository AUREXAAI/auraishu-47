export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="h-14 w-14 animate-pulse rounded-2xl bg-[#1A1A2E]" />
        <div className="h-7 w-24 animate-pulse rounded-lg bg-[#1A1A2E]" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-28 animate-pulse rounded-2xl bg-[#1A1A2E]" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#1A1A2E]" />
        <div className="h-28 animate-pulse rounded-2xl bg-[#1A1A2E]" />
      </div>
    </div>
  );
}
