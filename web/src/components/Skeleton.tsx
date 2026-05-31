/** Reusable skeleton loading placeholders for perceived performance. */

const base = "animate-pulse rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`${base} h-4 ${className}`} />;
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`${base} ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white/80 rounded-2xl border border-white/70 p-5 space-y-3">
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-full h-10" />
      <SkeletonLine className="w-2/3" />
    </div>
  );
}

export function SkeletonFileItem() {
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
      <SkeletonBlock className="w-8 h-8 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine className="w-1/2" />
        <SkeletonLine className="w-1/4 h-3" />
      </div>
      <SkeletonBlock className="w-16 h-5 rounded-full" />
    </div>
  );
}

export function SkeletonResultItem() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl">
      <SkeletonLine className="w-1/3" />
      <div className="flex gap-2">
        <SkeletonBlock className="w-16 h-7 rounded-lg" />
        <SkeletonBlock className="w-16 h-7 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white/80 backdrop-blur border border-white/70 rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-9 h-9 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <SkeletonLine className="w-1/3 h-5" />
          <SkeletonLine className="w-1/2 h-3" />
        </div>
      </div>
    </div>
  );
}
