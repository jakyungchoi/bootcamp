"use client";

// 교육 관리 페이지 "오프라인 교육장" 섹션을 통째로 관리하는 화면.
// - 전체 설명 (사진 슬라이드 위에 표시되는 한 줄~여러 줄 소개)
// - 사진 목록 (공개 화면에서 좌우로 넘겨보는 슬라이드로 표시. 교육 문화 프로그램과 같은 방식)
// - 특징 카드 목록 (제목 + 한 줄 설명. 자유롭게 추가/삭제/순서 변경 가능)
// site_settings 테이블의 관련 컬럼만 따로 불러오고 저장해서 다른 화면의 저장과 서로 덮어쓰지 않는다.

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { TrainingFacilityHighlight, TrainingFacilityPhoto } from "@/lib/types";

type FormState = {
  training_facility_description: string;
  training_facility_photos: TrainingFacilityPhoto[];
  training_facility_highlights: TrainingFacilityHighlight[];
};

export function TrainingFacilityEditor({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (err) setError(err.message);
      else if (data) {
        setForm({
          training_facility_description: data.training_facility_description ?? "",
          training_facility_photos: data.training_facility_photos ?? [],
          training_facility_highlights: data.training_facility_highlights ?? [],
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function addPhoto() {
    setForm((f) => (f ? { ...f, training_facility_photos: [...f.training_facility_photos, { image_url: null }] } : f));
  }

  function updatePhoto(idx: number, image_url: string | null) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.training_facility_photos];
      next[idx] = { image_url };
      return { ...f, training_facility_photos: next };
    });
  }

  function removePhoto(idx: number) {
    setForm((f) =>
      f ? { ...f, training_facility_photos: f.training_facility_photos.filter((_, i) => i !== idx) } : f,
    );
  }

  function movePhoto(idx: number, direction: -1 | 1) {
    setForm((f) => {
      if (!f) return f;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= f.training_facility_photos.length) return f;
      const next = [...f.training_facility_photos];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return { ...f, training_facility_photos: next };
    });
  }

  function addHighlight() {
    setForm((f) => {
      if (!f) return f;
      const newItem: TrainingFacilityHighlight = {
        id: `tf-${Math.random().toString(36).slice(2, 8)}`,
        title: "",
        description: "",
      };
      return { ...f, training_facility_highlights: [...f.training_facility_highlights, newItem] };
    });
  }

  function updateHighlight(idx: number, patch: Partial<TrainingFacilityHighlight>) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.training_facility_highlights];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, training_facility_highlights: next };
    });
  }

  function removeHighlight(idx: number) {
    if (!confirm("이 특징 카드를 삭제할까요?")) return;
    setForm((f) =>
      f ? { ...f, training_facility_highlights: f.training_facility_highlights.filter((_, i) => i !== idx) } : f,
    );
  }

  function moveHighlight(idx: number, direction: -1 | 1) {
    setForm((f) => {
      if (!f) return f;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= f.training_facility_highlights.length) return f;
      const next = [...f.training_facility_highlights];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return { ...f, training_facility_highlights: next };
    });
  }

  async function handleSave() {
    if (!supabase || !form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase.from("site_settings").update(form).eq("id", 1);
    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-400">
        <Loader2 className="mr-1 inline animate-spin" size={14} /> 불러오는 중...
      </div>
    );
  }
  if (!form) {
    return <p className="mb-6 text-sm text-red-500">{error ?? "설정을 불러오지 못했습니다."}</p>;
  }

  return (
    <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="font-semibold text-neutral-800">오프라인 교육장</h2>
      <p className="mt-1 text-sm text-neutral-500">
        교육 관리 페이지에 표시되는 오프라인 교육 환경 소개 섹션입니다. 전체 설명 아래에 사진이
        좌우로 넘겨보는 슬라이드로 표시되고(교육 문화 프로그램과 같은 방식 — 한 장만 등록해도
        되고, 여러 장이면 첫 사진과 마지막 사진이 끊기지 않고 이어집니다), 그 아래에 짧은 특징
        카드를 자유롭게 추가할 수 있습니다.
      </p>

      <div className="mt-4 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">전체 설명</label>
          <textarea
            value={form.training_facility_description}
            rows={2}
            onChange={(e) => setForm({ ...form, training_facility_description: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            placeholder="예: 배움에 집중할 수 있는 전용 교육 환경을 제공합니다."
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700">사진 (슬라이드)</label>
            <button
              type="button"
              onClick={addPhoto}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              <Plus size={12} />
              사진 추가
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {form.training_facility_photos.map((photo, idx, arr) => (
              <div key={idx} className="rounded-lg border border-neutral-200 p-2.5">
                <ImageUploadField
                  value={photo.image_url}
                  onChange={(url) => updatePhoto(idx, url)}
                  folder="training-facility"
                />
                <div className="mt-2 flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => movePhoto(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                      aria-label="앞으로"
                    >
                      <span className="block text-xs leading-none">◀</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(idx, 1)}
                      disabled={idx === arr.length - 1}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                      aria-label="뒤로"
                    >
                      <span className="block text-xs leading-none">▶</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="rounded p-1 text-red-400 hover:bg-red-50"
                    aria-label="삭제"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {form.training_facility_photos.length === 0 && (
              <p className="text-sm text-neutral-400">
                사진이 없으면 빈 placeholder가 표시됩니다. &quot;사진 추가&quot;로 등록해보세요.
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700">특징 카드 (직접 추가)</label>
            <button
              type="button"
              onClick={addHighlight}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              <Plus size={12} />
              카드 추가
            </button>
          </div>
          <p className="mb-2 text-xs text-neutral-400">
            사진 아래에 나란히 표시되는 짧은 특징 카드입니다. (예: &quot;매일 다니기 편한
            역세권 캠퍼스&quot; / &quot;구로디지털단지역 도보 10분&quot;) 개수 제한 없이
            자유롭게 추가·삭제·순서 변경할 수 있습니다.
          </p>
          <div className="space-y-2">
            {form.training_facility_highlights.map((h, idx, arr) => (
              <div key={h.id} className="flex items-start gap-2 rounded-lg border border-neutral-200 p-2">
                <div className="mt-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveHighlight(idx, -1)}
                    disabled={idx === 0}
                    className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                    aria-label="위로"
                  >
                    <span className="block text-xs leading-none">▲</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveHighlight(idx, 1)}
                    disabled={idx === arr.length - 1}
                    className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                    aria-label="아래로"
                  >
                    <span className="block text-xs leading-none">▼</span>
                  </button>
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={h.title}
                    placeholder="카드 제목 (예: 매일 다니기 편한 역세권 캠퍼스)"
                    onChange={(e) => updateHighlight(idx, { title: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-semibold focus:border-brand focus:outline-none"
                  />
                  <input
                    type="text"
                    value={h.description}
                    placeholder="한 줄 설명 (예: 구로디지털단지역 도보 10분)"
                    onChange={(e) => updateHighlight(idx, { description: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeHighlight(idx)}
                  className="mt-1 shrink-0 rounded p-1.5 text-red-400 hover:bg-red-50"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {form.training_facility_highlights.length === 0 && (
              <p className="text-sm text-neutral-400">
                특징 카드가 없습니다. &quot;카드 추가&quot;로 새로 만들어보세요.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? "저장 중..." : "저장"}
        </button>
        {saved && <span className="text-xs text-green-600">저장했습니다</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </section>
  );
}
