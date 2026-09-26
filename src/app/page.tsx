import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { ImagePlaceholder } from "@/components/ui/card";

// 관리자 페이지에서 저장한 내용이 재배포 없이 바로 보이도록 매 요청마다 새로 데이터를 가져온다.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {settings.home_hero_eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-[2.75rem] dark:text-white">
              {settings.home_hero_title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg dark:text-neutral-400">
              {settings.home_hero_subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                운영 교육 과정 보기
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/15 dark:text-neutral-200 dark:hover:bg-white/5"
              >
                기업 참여 안내
              </Link>
            </div>
          </div>
          {settings.home_hero_image_url ? (
            <Image
              src={settings.home_hero_image_url}
              alt="교육 현장 이미지"
              width={640}
              height={420}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          ) : (
            <ImagePlaceholder label="교육 현장 이미지" />
          )}
        </div>
      </section>

      {/* 4 core areas */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {settings.home_highlights.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group flex flex-col justify-between rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-900"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                  {item.eyebrow}
                </p>
                <h3 className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                자세히 보기
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
