"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    router.replace("/admin");
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-lg font-bold text-neutral-900">Supabase가 아직 연결되지 않았습니다</p>
        <p className="mt-2 text-sm text-neutral-500">
          먼저 .env.local 에 Supabase 정보를 설정해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <h1 className="text-xl font-bold text-neutral-900">관리자 로그인</h1>
      <p className="mt-1 text-sm text-neutral-500">
        원티드랩 부트캠프 웹페이지 관리자 계정으로 로그인하세요.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
        <input
          type="password"
          required
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          로그인
        </button>
      </form>
    </div>
  );
}
