import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PublicChrome } from "@/components/layout/public-chrome";
import { getSiteSettings } from "@/lib/data";

// Pretendard(한글 웹폰트)를 npm 패키지("pretendard")에 들어있는 파일 그대로 빌드에
// 포함시킨다. Google Fonts 같은 외부 CDN에는 전혀 요청을 보내지 않으면서도, 시스템 폰트에만
// 의존할 때 생기던 문제(예: macOS/Safari가 큰 글씨에서 시스템 폰트를 자동으로 다른 굵기의
// 폰트로 바꿔버려서 "교육 성과 지표" 숫자만 다른 글씨체처럼 보이던 문제)를 없애준다. 이제는
// 어떤 기기·브라우저에서 보든 모든 글자가 항상 이 폰트 하나로 통일되어 보인다.
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "원티드랩 부트캠프 교육사업",
  description:
    "교육을 넘어, 실제 커리어로 연결되는 교육 — 원티드랩 부트캠프 교육사업 소개 페이지",
};

// 관리자 페이지에서 저장하면 재배포 없이 바로 반영되어야 하므로, 빌드 시점에 한 번만
// 데이터를 가져와 고정된 화면을 만들지 않고 매 요청마다 Supabase에서 새로 가져온다.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="ko" className={`h-full antialiased ${pretendard.variable}`}>
      <body className="flex min-h-full flex-col break-keep bg-white font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <PublicChrome
          siteName={settings.site_name}
          logoUrl={settings.logo_url}
          navItems={settings.nav_items}
          footerDescription={settings.footer_description}
        >
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
