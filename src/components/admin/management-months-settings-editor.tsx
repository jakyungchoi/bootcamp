"use client";

// "개월차별 관리" 타임라인의 전체 설정(안내 문구 + 전체 교육 기간)을 관리하는 화면.
// 막대(개월차) 하나하나의 내용은 아래 ResourceCrud 목록에서 추가/수정하고, 여기서는 그 막대들이
// 기준으로 삼는 "전체 교육 기간"만 관리한다. (예: 가장 긴 과정이 6개월이면 6으로 설정 — 그러면
// "1~2개월차"로 등록한 막대는 전체 너비의 2/6을 차지하게 된다)

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type FormState = {
  management_months_description: string;
  management_months_total_months: number;
};

export function ManagementMonthsSettingsEditor({ onSaved }: { onSaved?: () => void }) {
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
          management_months_description: data.management_months_description ?? "",
          management_months_total_months: data.management_months_total_months ?? 6,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

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
      <h2 className="font-semibold text-neutral-800">개월차별 관리 — 타임라인 설정</h2>
      <p className="mt-1 text-sm text-neutral-500">
        공개 화면에서 이 섹션은 카드가 아니라 가로 막대(타임라인) 그래프로 표시됩니다. 아래
        &quot;전체 교육 기간&quot;을 기준으로 각 막대(개월차)의 너비가 정해지므로, 가장 긴 과정의
        개월 수를 입력해주세요. (예: 가장 긴 과정이 6개월이면 6)
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">전체 교육 기간 (개월)</label>
          <input
            type="number"
            min={1}
            value={form.management_months_total_months}
            onChange={(e) =>
              setForm({ ...form, management_months_total_months: Number(e.target.value) })
            }
            className="w-28 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-400">
            아래 목록에서 각 막대를 &quot;시작 개월차&quot;/&quot;종료 개월차&quot;로 등록하면,
            이 전체 기간 대비 그 구간이 차지하는 비율만큼 막대 너비가 정해집니다.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">안내 문구</label>
          <textarea
            value={form.management_months_description}
            rows={2}
            onChange={(e) => setForm({ ...form, management_months_description: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-400">
            공개 화면에서 &quot;개월차별 관리&quot; 제목 바로 아래에 표시되는 한 줄 설명입니다.
          </p>
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
