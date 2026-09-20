"use client";

// 관리자 로그인 상태를 관리자 페이지 전체에서 공유하기 위한 Context.
// - 로그인 여부(session)와, admin_users 테이블에 등록된 사람인지(isAdmin)를 함께 확인한다.
// - admin_users 에 없는 사람이 로그인하면(예: 실수로 다른 계정으로 로그인) 접근을 막는다.

import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

type AdminAuthState = {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
  supabaseConfigured: boolean;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthState>({
  loading: true,
  session: null,
  isAdmin: false,
  supabaseConfigured: false,
  signOut: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Supabase 미설정은 고정값이라 즉시 반영해도 안전함
      setLoading(false);
      return;
    }

    let active = true;

    async function checkAdmin(currentSession: Session | null) {
      if (!currentSession || !supabase) {
        if (active) setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", currentSession.user.id)
        .maybeSingle();
      if (active) setIsAdmin(Boolean(data));
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      checkAdmin(data.session).finally(() => {
        if (active) setLoading(false);
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      checkAdmin(newSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AdminAuthContext.Provider
      value={{ loading, session, isAdmin, supabaseConfigured: isSupabaseConfigured, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
