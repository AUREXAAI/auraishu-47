export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-24">
      <div className="h-16 w-16 animate-pulse rounded-2xl bg-[#1A1A2E]" />
      <div className="h-6 w-24 animate-pulse rounded-lg bg-[#1A1A2E]" />
    </div>
  );
}
