"use client";

// 관리자가 새로 추가한 "커스텀 페이지"(=새 탭) 편집 화면.
// 제목/영문 소제목/설명은 페이지 맨 위에, sections 는 그 아래 카드 형태로 순서대로 보여진다.
// 공개 여부(is_published)를 끄면 /pages/[slug] 접속 시 보이지 않는다 (관리자 목록에는 계속 보임).

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { CustomPage, CustomPageSection } from "@/lib/types";

export default function CustomPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data, error: err } = await supabase.from("custom_pages").select("*").eq("id", id).maybeSingle();
      if (err) setError(err.message);
      else if (!data) setNotFound(true);
      else setPage(data as CustomPage);
      setLoading(false);
    }
    load();
  }, [id]);

  function updateSection(idx: number, patch: Partial<CustomPageSection>) {
    setPage((p) => {
      if (!p) return p;
      const next = [...p.sections];
      next[idx] = { ...next[idx], ...patch };
      return { ...p, sections: next };
    });
  }

  function addSection() {
    setPage((p) => (p ? { ...p, sections: [...p.sections, { heading: "", body: "" }] } : p));
  }

  function removeSection(idx: number) {
    setPage((p) => (p ? { ...p, sections: p.sections.filter((_, i) => i !== idx) } : p));
  }

  function moveSection(idx: number, direction: -1 | 1) {
    setPage((p) => {
      if (!p) return p;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= p.sections.length) return p;
      const next = [...p.sections];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return { ...p, sections: next };
    });
  }

  async function handleSave() {
    if (!supabase || !page) return;
    if (!/^[a-z0-9-]+$/.test(page.slug)) {
      setError("공개 주소는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase
      .from("custom_pages")
      .update({
        title: page.title,
        slug: page.slug,
        eyebrow: page.eyebrow,
        description: page.description,
        sections: page.sections,
        is_published: page.is_published,
      })
      .eq("id", page.id);
    setSaving(false);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleDelete() {
    if (!supabase || !page) return;
    if (!confirm(`"${page.title}" 탭을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await supabase.from("custom_pages").delete().eq("id", page.id);
    router.push("/admin");
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-neutral-400">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }
  if (notFound || !page) {
    return (
      <div>
        <p className="text-sm text-red-500">해당 탭을 찾을 수 없습니다.</p>
        <Link href="/admin" className="mt-3 inline-block text-sm text-brand underline">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">탭 편집: {page.title}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            공개 주소:{" "}
            <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer" className="text-brand underline">
              /pages/{page.slug}
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <Trash2 size={14} />
          탭 삭제
        </button>
      </div>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-neutral-800">기본 정보</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">탭 이름 / 제목</label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">공개 주소 (영문/숫자/하이픈)</label>
            <input
              type="text"
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-400">
              방문자는 이 페이지를 /pages/주소 로 접속합니다. 헤더 메뉴에도 넣고 싶다면 &quot;사이트 전역
              설정&quot;의 헤더 메뉴 항목에서 이 주소를 추가해주세요.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">영문 소제목</label>
            <input
              type="text"
              value={page.eyebrow}
              placeholder="예: FAQ"
              onChange={(e) => setPage({ ...page, eyebrow: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">설명</label>
            <textarea
              value={page.description}
              rows={2}
              onChange={(e) => setPage({ ...page, description: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={page.is_published}
              onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
            />
            공개 (체크 해제하면 방문자에게 보이지 않습니다)
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800">본문 카드</h2>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <Plus size={13} />
            카드 추가
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {page.sections.length === 0 && (
            <p className="text-sm text-neutral-400">아직 카드가 없습니다. &quot;카드 추가&quot;로 만들어보세요.</p>
          )}
          {page.sections.map((section, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">카드 {idx + 1}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, -1)}
                    disabled={idx === 0}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                    aria-label="위로"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 1)}
                    disabled={idx === page.sections.length - 1}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                    aria-label="아래로"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(idx)}
                    className="rounded p-1 text-red-400 hover:bg-red-50"
                    aria-label="삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={section.heading}
                  placeholder="카드 제목"
                  onChange={(e) => updateSection(idx, { heading: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                <textarea
                  value={section.body}
                  placeholder="카드 내용"
                  rows={3}
                  onChange={(e) => updateSection(idx, { body: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          ))}
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
        <Link href="/admin" className="text-sm font-medium text-neutral-500 hover:text-neutral-700">
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
