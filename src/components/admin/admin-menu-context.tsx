"use client";

// 관리자 대시보드에서 메뉴 이름을 바꾸면(연필 아이콘), 그 메뉴로 들어갔을 때 보이는 콘텐츠
// 관리 화면의 제목에도 똑같이 반영되도록 해주는 훅. admin/layout.tsx가 사이드바를 그릴 때 이미
// 한 번 불러온 메뉴 목록(admin_menu_overrides 반영 완료)을 그대로 물려받아 쓰기 때문에,
// 각 관리 화면이 따로 데이터베이스에 다시 물어볼 필요가 없다.
//
// 아직 메뉴 목록을 불러오는 중이거나(로그인 직후 아주 짧은 순간) 이름을 한 번도 안 바꾼
// 항목이면, 코드에 원래 정해둔 기본 이름(fallback)을 그대로 보여준다.

import { createContext, useContext } from "react";
import type { MergedMenuItem } from "@/lib/admin-menu";

const AdminMenuContext = createContext<MergedMenuItem[]>([]);

export function AdminMenuProvider({
  menu,
  children,
}: {
  menu: MergedMenuItem[];
  children: React.ReactNode;
}) {
  return <AdminMenuContext.Provider value={menu}>{children}</AdminMenuContext.Provider>;
}

export function useAdminMenuLabel(key: string, fallback: string): string {
  const menu = useContext(AdminMenuContext);
  const item = menu.find((m) => m.key === key);
  return item?.label?.trim() ? item.label : fallback;
}
