"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavItem } from "@/lib/types";

type NavbarProps = {
  siteName: string;
  logoUrl: string | null;
  navItems: NavItem[];
};

export function Navbar({ siteName, logoUrl, navItems }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          {logoUrl ? (
            // 업로드되는 로고마다 가로세로 비율이 달라서 next/image 의 고정 width/height 대신
            // 원본 비율 그대로(h-8 w-auto) 보여준다.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto max-w-[160px] object-contain" />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">
              {siteName.charAt(0)}
            </span>
          )}
          <span className="text-[15px]">{siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="메뉴 열기"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 md:hidden dark:text-neutral-200"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-black/5 bg-white px-5 pb-4 md:hidden dark:border-white/10 dark:bg-neutral-950">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-200"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
