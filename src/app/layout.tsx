import type { Metadata } from "next";
import "./globals.css";
import { PublicChrome } from "@/components/layout/public-chrome";
import { getSiteSettings } from "@/lib/data";

// 시스템 폰트 스택을 사용한다 (Google Fonts 외부 요청에 의존하지 않도록).
// 브랜드 서체가 정해지면 next/font/local 로 교체하면 된다.

export const metadata: Metadata = {
  title: "원티드랩 부트캠프 교육사업",
  description:
    "교육을 넘어, 실제 커리어로 연결되는 교육 — 원티드랩 부트캠프 교육사업 소개 페이지",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col break-keep bg-white font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <PublicChrome
          siteName={settings.site_name}
          logoUrl={settings.logo_url}
          navItems={settings.home_highlights}
          footerDescription={settings.footer_description}
        >
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
