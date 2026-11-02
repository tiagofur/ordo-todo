import { AppLayout } from "@/components/shared/app-layout";
import { Skeleton } from "@/components/shared/skeleton";

/**
 * Calendar loading boundary (Next.js route convention).
 * Mirrors the calendar layout — header, month grid, aside tray — with
 * placeholders only, so no copy means no i18n keys are needed.
 */
export function CalendarLoadingContent() {
  return (
    <div className="space-y-5 h-full flex flex-col min-h-0">
      {/* Header placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="hidden md:block h-9 w-64 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Main workspace placeholder */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-5 pb-2 overflow-hidden">
        <div className="flex-1 min-h-[520px] lg:min-h-0 border border-border/60 rounded-2xl bg-card p-4 h-full">
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={`head-${i}`} className="h-6 w-full" />
            ))}
            {[...Array(28)].map((_, i) => (
              <Skeleton key={`cell-${i}`} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80 xl:w-88 shrink-0 space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={`tray-${i}`} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CalendarLoading() {
  return (
    <AppLayout>
      <CalendarLoadingContent />
    </AppLayout>
  );
}
