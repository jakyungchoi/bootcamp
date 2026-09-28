"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/auth-context";
import { AdminMenuProvider } from "@/components/admin/admin-menu-context";
import { getMergedAdminMenu, groupLabelForKey, type MergedMenuItem } from "@/lib/admin-menu";

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

  // 로그인 안 된 상태면 로그인 화면으로 보낸다. 화면을 그리는 도중(render)에 바로
  // router.replace()를 부르면 "다른 컴포넌트를 그리는 중에 상태를 바꾸려 했다"는 경고가
  // 뜨므로(리액트 규칙 위반), useEffect 안에서 그리기가 끝난 뒤에 이동시킨다.
  useEffect(() => {
    if (!loading && supabaseConfigured && !session) {
      router.replace("/admin/login");
    }
  }, [loading, supabaseConfigured, session, router]);

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
            const groups = visibleItems.map((item) => groupLabelForKey(item.key, item.isCustom, item.pageKey));
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
