import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PublicChrome } from "@/components/layout/public-chrome";
import { getSiteSettings } from "@/lib/data";

// Pretendard(한글 웹폰트)를 npm 패키지("pretendard")에 들어있는 파일 그대로 빌드에
// 포함시킨다. Google Fonts 같은 외부 CDN에는 전혀 요청을 보내지 않는다.
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--font-pretendard",
  display: "swap",
});

// "교육 성과 지표" 숫자가 주변 한글과 다른 폰트처럼 보이던 문제는 폰트가 잘못 로딩되는
// 버그가 아니라, Pretendard가 한글은 도장체처럼, 숫자/영문(0-9, O 등)은 훨씬 동글동글하고
// 기계적으로 그리도록 원래 그렇게 디자인되어 있어서였다 (실제로 확인함). 숫자만 다른 서체로
// 바꿔달라는 요청에 따라, 숫자 표시용으로 IBM Plex Sans(무료 오픈소스 서체, npm 패키지
// "@fontsource/ibm-plex-sans"에 들어있는 파일을 그대로 사용 — 역시 외부 요청 없음)를 별도로
// 불러와 globals.css의 ".font-numeral" 클래스에서만 쓴다. 이 폰트에는 한글 글자가 없어서,
// 같은 문단 안에 숫자와 한글이 섞여 있어도(예: "OOO명") 브라우저가 자동으로 숫자만 이 폰트로,
// 한글은 그대로 Pretendard로 그려준다.
const numeral = localFont({
  src: [
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-numeral",
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
    <html lang="ko" className={`h-full antialiased ${pretendard.variable} ${numeral.variable}`}>
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
