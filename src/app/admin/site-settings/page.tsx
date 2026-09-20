"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { HomeHighlight } from "@/lib/types";

type SettingsForm = {
  site_name: string;
  logo_url: string | null;
  footer_description: string;
  home_hero_eyebrow: string;
  home_hero_title: string;
  home_hero_subtitle: string;
  home_hero_image_url: string | null;
  home_highlights: HomeHighlight[];
};

export default function SiteSettingsPage() {
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data, error: err } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (err) setError(err.message);
      else if (data) {
        setForm({
          site_name: data.site_name,
          logo_url: data.logo_url,
          footer_description: data.footer_description,
          home_hero_eyebrow: data.home_hero_eyebrow ?? "Wanted Lab Education",
          home_hero_title: data.home_hero_title,
          home_hero_subtitle: data.home_hero_subtitle,
          home_hero_image_url: data.home_hero_image_url,
          home_highlights: data.home_highlights,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function updateHighlight(idx: number, patch: Partial<HomeHighlight>) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.home_highlights];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, home_highlights: next };
    });
  }

  function addHighlight() {
    setForm((f) => {
      if (!f) return f;
      const newItem: HomeHighlight = {
        key: `item-${Math.random().toString(36).slice(2, 8)}`,
        href: "",
        title: "",
        eyebrow: "",
        description: "",
      };
      return { ...f, home_highlights: [...f.home_highlights, newItem] };
    });
  }

  function removeHighlight(idx: number) {
    if (!confirm("이 메뉴 항목을 삭제할까요? 헤더 메뉴와 홈 화면 카드에서 함께 사라집니다.")) return;
    setForm((f) => {
      if (!f) return f;
      return { ...f, home_highlights: f.home_highlights.filter((_, i) => i !== idx) };
    });
  }

  async function handleSave() {
    if (!supabase || !form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase.from("site_settings").update(form).eq("id", 1);
    setSaving(false);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return <div className="py-10 text-center text-neutral-400"><Loader2 className="mx-auto animate-spin" /></div>;
  }
  if (!form) {
    return <p className="text-sm text-red-500">{error ?? "설정을 불러오지 못했습니다."}</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-neutral-900">사이트 전역 설정</h1>
      <p className="mt-1 text-sm text-neutral-500">
        로고, 사이트 이름, 헤더 메뉴 문구, 홈 화면 히어로 문구를 관리합니다.
      </p>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-800">기본 정보</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">로고</label>
            <ImageUploadField
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              folder="site"
            />
            <p className="mt-1 text-xs text-neutral-400">
              로고를 올리지 않으면 사이트 이름의 첫 글자가 아이콘으로 표시됩니다.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">사이트 이름</label>
            <input
              type="text"
              value={form.site_name}
              onChange={(e) => setForm({ ...form, site_name: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">푸터 소개 문구</label>
            <textarea
              value={form.footer_description}
              rows={3}
              onChange={(e) => setForm({ ...form, footer_description: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-800">홈 화면 히어로</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              상단 영문 소제목 (예: WANTED LAB EDUCATION)
            </label>
            <input
              type="text"
              value={form.home_hero_eyebrow}
              onChange={(e) => setForm({ ...form, home_hero_eyebrow: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">제목</label>
            <input
              type="text"
              value={form.home_hero_title}
              onChange={(e) => setForm({ ...form, home_hero_title: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">부제목</label>
            <textarea
              value={form.home_hero_subtitle}
              rows={2}
              onChange={(e) => setForm({ ...form, home_hero_subtitle: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">히어로 이미지</label>
            <ImageUploadField
              value={form.home_hero_image_url}
              onChange={(url) => setForm({ ...form, home_hero_image_url: url })}
              folder="site"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-neutral-800">헤더 메뉴 · 홈 핵심 영역 카드</h2>
            <p className="mt-1 text-sm text-neutral-500">
              여기서 항목을 추가·삭제·수정하면 상단 헤더 메뉴와 홈 화면 카드에 동시에 반영됩니다. 새 탭(커스텀
              페이지)을 추가했다면 그 페이지의 공개 주소(/pages/...)를 링크 주소에 입력해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={addHighlight}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <Plus size={13} />
            항목 추가
          </button>
        </div>
        <div className="mt-4 space-y-5">
          {form.home_highlights.map((h, idx) => (
            <div key={h.key} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">항목 {idx + 1}</p>
                <button
                  type="button"
                  onClick={() => removeHighlight(idx)}
                  className="rounded p-1 text-red-400 hover:bg-red-50"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={h.title}
                  placeholder="메뉴/카드 제목"
                  onChange={(e) => updateHighlight(idx, { title: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  value={h.href}
                  placeholder="링크 주소 (예: /courses 또는 /pages/faq)"
                  onChange={(e) => updateHighlight(idx, { href: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none"
                />
                <input
                  type="text"
                  value={h.eyebrow}
                  placeholder="영문 소제목 (예: What we teach)"
                  onChange={(e) => updateHighlight(idx, { eyebrow: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                <textarea
                  value={h.description}
                  rows={2}
                  placeholder="카드 설명"
                  onChange={(e) => updateHighlight(idx, { description: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          ))}
          {form.home_highlights.length === 0 && (
            <p className="text-sm text-neutral-400">
              항목이 없으면 헤더 메뉴와 홈 화면 카드도 비어 보입니다. &quot;항목 추가&quot;로 만들어보세요.
            </p>
          )}
        </div>
      </section>

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
