import { ArrowDown, ArrowRight } from "lucide-react";
import { Icon } from "@/components/icon-map";
import type { QualityProcessStep } from "@/lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// "교육 품질 관리" 섹션 맨 위 프로세스 흐름. 기존 FlowSteps(짧은 텍스트 칸 + 화살표)와 달리,
// 칸마다 아이콘 + 번호 + 제목 + 짧은 설명이 들어가는 카드 형태다. 화살표로 이어지는 느낌은
// 그대로 유지한다.
export function ProcessStepFlow({ steps }: { steps: QualityProcessStep[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-stretch md:gap-3">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2 md:contents">
          <div className="flex flex-1 flex-col rounded-xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900 md:min-w-[180px] md:basis-[220px]">
            <div className="flex items-center gap-2">
              {step.icon && <Icon name={step.icon} className="h-5 w-5 text-brand" />}
              <span className="text-xs font-bold text-brand">{pad(i + 1)}</span>
            </div>
            <p className="mt-2 text-sm font-bold text-neutral-900 dark:text-white">{step.title}</p>
            {step.description && (
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {step.description}
              </p>
            )}
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
