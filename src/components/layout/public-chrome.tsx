"use client";

// /admin 경로에서는 공개 사이트의 헤더/푸터를 숨기고 관리자 페이지 자체 레이아웃만 보여준다.

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import type { NavItem } from "@/lib/types";

type PublicChromeProps = {
  siteName: string;
  logoUrl: string | null;
  navItems: NavItem[];
  footerDescription: string;
  children: React.ReactNode;
};

export function PublicChrome({
  siteName,
  logoUrl,
  navItems,
  footerDescription,
  children,
}: PublicChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar siteName={siteName} logoUrl={logoUrl} navItems={navItems} />
      <main className="flex-1">{children}</main>
      <Footer siteName={siteName} description={footerDescription} />
    </>
  );
}
