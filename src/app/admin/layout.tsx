"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/auth-context";
import { AdminMenuProvider } from "@/components/admin/admin-menu-context";
import { getMergedAdminMenu, type MergedMenuItem } from "@/lib/admin-menu";

// 메뉴 항목이 실제로 어느 공개 페이지에 속하는지 묶어서, 사이드바에 구분선 + 그룹 이름을
// 보여주기 위한 표. 처음 보는 사람도 "이 메뉴들이 이 페이지 하나를 구성한다"는 걸 한눈에
// 알 수 있게 하려는 목적이라, 실제 데이터 구조와는 별개로 화면 표시용으로만 쓰인다.
const MENU_GROUPS: { label: string; keys: string[] }[] = [
  { label: "전역 설정", keys: ["site-settings", "page-headers"] },
  { label: "운영 교육 과정 페이지", keys: ["categories", "duration-types", "courses", "curriculum"] },
  { label: "교육 문화 페이지", keys: ["culture"] },
  {
    label: "교육 관리 페이지",
    keys: [
      "learner-management",
      "support-plans",
      "management-months",
      "management-metrics",
      "training-facility",
      "quality-management",
      "collaboration-tools",
    ],
  },
  { label: "참여 기업 연계 페이지", keys: ["participation-types", "company-flow", "case-studies"] },
];

function groupLabelForKey(key: string, isCustom: boolean): string {
  if (isCustom) return "추가한 페이지";
  return MENU_GROUPS.find((g) => g.keys.includes(key))?.label ?? "기타";
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, session, isAdmin, supabaseConfigured, signOut } = useAdminAuth();
  const [menu, setMenu] = useState<MergedMenuItem[]>([]);

  useEffect(() => {
    async function loadMenu() {
      if (!isAdmin) return;
      const items = await getMergedAdminMenu();
      setMenu(items);
    }
    loadMenu();
  }, [isAdmin]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (!supabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="text-lg font-bold text-neutral-900">Supabase가 아직 연결되지 않았습니다</p>
        <p className="mt-2 text-sm text-neutral-500">
          .env.local 에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 설정한 뒤
          관리자 페이지를 이용할 수 있습니다.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="px-5 py-24 text-center text-neutral-400">확인 중...</div>;
  }

  if (!session) {
    router.replace("/admin/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="text-lg font-bold text-neutral-900">관리자 권한이 없습니다</p>
        <p className="mt-2 text-sm text-neutral-500">
          이 계정은 admin_users 테이블에 등록되어 있지 않습니다. 관리자에게 등록을 요청해주세요.
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-6 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-5 py-10">
      <aside className="w-56 shrink-0">
        <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          관리자 페이지
        </p>
        <nav className="mt-3 space-y-0.5">
          <Link
            href="/admin"
            className={`block rounded-lg px-2.5 py-2 text-sm font-medium ${
              pathname === "/admin" ? "bg-brand/10 text-brand" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            대시보드
          </Link>
          {(() => {
            const visibleItems = menu.filter((item) => item.isVisible);
            const groups = visibleItems.map((item) => groupLabelForKey(item.key, item.isCustom));
            return visibleItems.map((item, idx) => {
              const group = groups[idx];
              const showGroupLabel = idx === 0 || group !== groups[idx - 1];
              const isFirst = idx === 0;
              return (
                <div key={item.key}>
                  {showGroupLabel && (
                    <div className={isFirst ? "pt-1" : "mt-3 border-t border-neutral-200 pt-3"}>
                      <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                        {group}
                      </p>
                    </div>
                  )}
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-2.5 py-2 text-sm font-medium ${
                      pathname === item.href
                        ? "bg-brand/10 text-brand"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            });
          })()}
        </nav>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
        >
          <LogOut size={15} />
          로그아웃
        </button>
        <Link
          href="/"
          className="mt-1 block rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-100"
        >
          사이트로 돌아가기
        </Link>
      </aside>
      <main className="min-w-0 flex-1">
        <AdminMenuProvider menu={menu}>{children}</AdminMenuProvider>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <AdminShell>{children}</AdminShell>
      </div>
    </AdminAuthProvider>
  );
}
