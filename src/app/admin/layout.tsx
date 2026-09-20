"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/auth-context";

const MENU = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/site-settings", label: "사이트 전역 설정" },
  { href: "/admin/categories", label: "교육 영역 카테고리" },
  { href: "/admin/courses", label: "대표 교육 과정" },
  { href: "/admin/curriculum", label: "커리큘럼 구성 단계" },
  { href: "/admin/culture", label: "교육 문화 프로그램" },
  { href: "/admin/learner-management", label: "학습자 관리 카드" },
  { href: "/admin/support-plans", label: "학습부진자 지도 계획" },
  { href: "/admin/quality-management", label: "교육 품질 관리" },
  { href: "/admin/collaboration-tools", label: "협업 도구" },
  { href: "/admin/participation-types", label: "기업 참여 방식" },
  { href: "/admin/company-flow", label: "이런 협업이 가능해요" },
  { href: "/admin/case-studies", label: "협업 사례" },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, session, isAdmin, supabaseConfigured, signOut } = useAdminAuth();

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
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-2.5 py-2 text-sm font-medium ${
                pathname === item.href
                  ? "bg-brand/10 text-brand"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
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
      <main className="min-w-0 flex-1">{children}</main>
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
