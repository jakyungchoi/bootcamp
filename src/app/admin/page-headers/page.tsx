"use client";

// 4개 주요 페이지(운영 교육 과정 / 교육 관리 / 교육 문화 / 참여 기업 연계) 맨 위에 나오는
// 영문 소제목 · 제목 · 설명 문구를 관리하는 화면.

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { pageHeaders as defaultPageHeaders } from "@/lib/content";
import type { PageHeader, PageHeaderKey } from "@/lib/types";

const PAGES: { key: PageHeaderKey; label: string }[] = [
  { key: "courses", label: "운영 교육 과정 (/courses)" },
  { key: "education-management", label: "교육 관리 (/education-management)" },
  { key: "culture", label: "교육 문화 (/culture)" },
  { key: "partners", label: "참여 기업 연계 (/partners)" },
];

type FormState = Record<PageHeaderKey, PageHeader>;

export default function PageHeadersAdminPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setForm(defaultPageHeaders);
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase.from("page_headers").select("*");
      if (err) {
        setError(err.message);
      } else {
        const next = { ...defaultPageHeaders };
        for (const row of (data as PageHeader[]) ?? []) {
          if (row.page_key in next) {
            next[row.page_key as PageHeaderKey] = row;
          }
        }
        setForm(next);
      }
      setLoading(false);
    }
    load();
  }, []);

  function updateField(key: PageHeaderKey, patch: Partial<PageHeader>) {
    setForm((f) => (f ? { ...f, [key]: { ...f[key], ...patch } } : f));
  }

  async function handleSave() {
    if (!supabase || !form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const rows = PAGES.map(({ key }) => ({
      page_key: key,
      eyebrow: form[key].eyebrow,
      title: form[key].title,
      description: form[key].description,
    }));
    const { error: err } = await supabase.from("page_headers").upsert(rows, { onConflict: "page_key" });
    setSaving(false);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-neutral-400">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }
  if (!form) {
    return <p className="text-sm text-red-500">{error ?? "설정을 불러오지 못했습니다."}</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900">페이지 상단 문구</h1>
      <p className="mt-1 text-sm text-neutral-500">
        각 페이지 맨 위에 나오는 영문 소제목 · 제목 · 설명 문구를 수정합니다.
      </p>

      <div className="mt-6 space-y-5">
        {PAGES.map(({ key, label }) => (
          <section key={key} className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold text-neutral-800">{label}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  영문 소제목 (예: What we teach)
                </label>
                <input
                  type="text"
                  value={form[key].eyebrow}
                  onChange={(e) => updateField(key, { eyebrow: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">제목</label>
                <input
                  type="text"
                  value={form[key].title}
                  onChange={(e) => updateField(key, { title: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">설명</label>
                <textarea
                  value={form[key].description}
                  rows={2}
                  onChange={(e) => updateField(key, { description: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          저장
        </button>
        {saved && <span className="text-sm text-emerald-600">저장되었습니다.</span>}
      </div>
    </div>
  );
}
