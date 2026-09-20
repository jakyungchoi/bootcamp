import { ArrowDown, ArrowRight } from "lucide-react";

export function FlowSteps({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2 md:contents">
          <div className="flex flex-1 items-center justify-center rounded-xl border border-black/5 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-800 shadow-sm dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100">
            {step}
          </div>
          {i < steps.length - 1 && (
            <span className="flex shrink-0 items-center justify-center text-neutral-300 dark:text-neutral-600">
              <ArrowDown className="md:hidden" size={18} />
              <ArrowRight className="hidden md:block" size={18} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
