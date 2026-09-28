"use client";

// 관리자가 새로 추가한 "커스텀 섹션"(= 기존 페이지 안에 끼워 넣는 새 섹션) 편집 화면.
// custom_pages(완전히 새로운 탭 = 별도 주소)와 다르게, 이건 운영 교육 과정 / 교육 관리 / 참여
// 기업 연계 페이지 중 하나를 골라서 그 페이지 안의 다른 섹션들과 순서를 섞어 넣는다. 실제 위치
// (몇 번째로 보일지)는 관리자 대시보드의 위/아래 화살표로 정한다 — 이 화면은 내용(제목/설명/
// 카드 목록)과 "어느 페이지에 넣을지"만 정한다.

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { AdminContentLayout } from "@/components/admin/admin-content-layout";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { CUSTOM_SECTION_PAGE_OPTIONS } from "@/lib/admin-menu";
import { ICON_OPTIONS } from "@/lib/icon-options";
import type { CustomSection, CustomSectionItem } from "@/lib/types";

export default function CustomSectionEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [section, setSection] = useState<CustomSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data, error: err } = await supabase.from("custom_sections").select("*").eq("id", id).maybeSingle();
      if (err) setError(err.message);
      else if (!data) setNotFound(true);
      else setSection(data as CustomSection);
      setLoading(false);
    }
    load();
  }, [id]);

  function updateItem(idx: number, patch: Partial<CustomSectionItem>) {
    setSection((s) => {
      if (!s) return s;
      const next = [...s.items];
      next[idx] = { ...next[idx], ...patch };
      return { ...s, items: next };
    });
  }

  function addItem() {
    setSection((s) =>
      s ? { ...s, items: [...s.items, { heading: "", body: "", icon: "", image_url: null }] } : s
    );
  }

  function removeItem(idx: number) {
    setSection((s) => (s ? { ...s, items: s.items.filter((_, i) => i !== idx) } : s));
  }

  function moveItem(idx: number, direction: -1 | 1) {
    setSection((s) => {
      if (!s) return s;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= s.items.length) return s;
      const next = [...s.items];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return { ...s, items: next };
    });
  }

  async function handleSave() {
    if (!supabase || !section) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase
      .from("custom_sections")
      .update({
        title: section.title,
        page_key: section.page_key,
        description: section.description,
        items: section.items,
        is_published: section.is_published,
      })
      .eq("id", section.id);
    setSaving(false);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setRefreshToken((n) => n + 1);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleDelete() {
    if (!supabase || !section) return;
    if (!confirm(`"${section.title}" 섹션을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await supabase.from("custom_sections").delete().eq("id", section.id);
    router.push("/admin");
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-neutral-400">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }
  if (notFound || !section) {
    return (
      <div>
        <p className="text-sm text-red-500">해당 섹션을 찾을 수 없습니다.</p>
        <Link href="/admin" className="mt-3 inline-block text-sm text-brand underline">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <AdminContentLayout
      refreshToken={refreshToken}
      previewOptions={[
        { label: section.title || "섹션 미리보기", path: `/${section.page_key}#custom-section-${section.id}` },
      ]}
    >
      <div className="max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">섹션 편집: {section.title || "(제목 없음)"}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              대시보드의 위/아래 화살표로 이 섹션이 몇 번째로 보일지 정할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} />
            섹션 삭제
          </button>
        </div>

        <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold text-neutral-800">기본 정보</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">섹션 제목</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => setSection({ ...section, title: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">이 섹션이 들어갈 페이지</label>
              <select
                value={section.page_key}
                onChange={(e) => setSection({ ...section, page_key: e.target.value as CustomSection["page_key"] })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              >
                {CUSTOM_SECTION_PAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-400">
                이 섹션이 실제로 몇 번째 순서에 나올지는 대시보드의 위/아래 화살표로 다른 섹션들과 함께
                정합니다.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">설명</label>
              <textarea
                value={section.description}
                rows={2}
                onChange={(e) => setSection({ ...section, description: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={section.is_published}
                onChange={(e) => setSection({ ...section, is_published: e.target.checked })}
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
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              <Plus size={13} />
              카드 추가
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {section.items.length === 0 && (
              <p className="text-sm text-neutral-400">아직 카드가 없습니다. &quot;카드 추가&quot;로 만들어보세요.</p>
            )}
            {section.items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">카드 {idx + 1}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                      aria-label="위로"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === section.items.length - 1}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                      aria-label="아래로"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
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
                    value={item.heading}
                    placeholder="카드 제목"
                    onChange={(e) => updateItem(idx, { heading: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                  <textarea
                    value={item.body}
                    placeholder="카드 내용"
                    rows={3}
                    onChange={(e) => updateItem(idx, { body: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">
                      아이콘 (선택 — 카드 맨 위에 표시됩니다)
                    </label>
                    <select
                      value={item.icon ?? ""}
                      onChange={(e) => updateItem(idx, { icon: e.target.value || null })}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    >
                      <option value="">(아이콘 없음)</option>
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">사진 (선택)</label>
                    <ImageUploadField
                      value={item.image_url ?? null}
                      onChange={(url) => updateItem(idx, { image_url: url })}
                      folder="custom-sections"
                    />
                  </div>
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
    </AdminContentLayout>
  );
}
