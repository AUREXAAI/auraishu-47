export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-[#1A1A2E]" />
      <div className="flex flex-col gap-3">
        <div className="h-20 animate-pulse rounded-2xl bg-[#1A1A2E]" />
        <div className="h-20 animate-pulse rounded-2xl bg-[#1A1A2E]" />
      </div>
    </div>
  );
}
