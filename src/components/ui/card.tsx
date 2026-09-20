import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-neutral-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function ImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-neutral-100 text-xs font-medium text-neutral-400 dark:from-brand/15 dark:to-neutral-800">
      {label ?? "이미지 영역"}
    </div>
  );
}
