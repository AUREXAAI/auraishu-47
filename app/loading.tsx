export default function Loading() {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="h-6 w-40 animate-pulse rounded-lg bg-[#1A1A2E]" />
      <div className="h-20 animate-pulse rounded-2xl bg-[#1A1A2E]" />
      <div className="h-20 animate-pulse rounded-2xl bg-[#1A1A2E]" />
      <div className="h-20 animate-pulse rounded-2xl bg-[#1A1A2E]" />
    </div>
  );
}
