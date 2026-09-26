"use client";

// "개월차별 관리" 간트 차트 표의 전체 설정(안내 문구 + 칸(열) 이름 목록)을 관리하는 화면.
// 막대 하나하나의 내용은 아래 ResourceCrud 목록에서 추가/수정하고, 여기서는 그 표의 맨 위에
// 나열되는 칸 이름들(예: "1개월차", "2개월차", ..., "수료 이후")을 관리한다. 각 구간 항목은
// 이 칸 목록의 몇 번째 칸인지로 시작/종료 위치를 저장하므로, 칸을 삭제하거나 순서를 바꾸면
// 이미 등록해둔 구간들이 가리키는 칸이 바뀔 수 있다 — 그래서 삭제/순서 변경 시 확인 문구를
// 띄우고, 화면에도 안내 문구를 남긴다.

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type FormState = {
  management_months_description: string;
  management_months_columns: string[];
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
          management_months_columns:
            data.management_months_columns && data.management_months_columns.length > 0
              ? data.management_months_columns
              : ["1개월차", "2개월차", "3개월차", "4개월차", "5개월차", "6개월차"],
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function addColumn() {
    setForm((f) => {
      if (!f) return f;
      const next = window.prompt("새 칸 이름을 입력하세요. (예: 수료 이후)");
      if (!next || !next.trim()) return f;
      return { ...f, management_months_columns: [...f.management_months_columns, next.trim()] };
    });
  }

  function updateColumn(idx: number, value: string) {
    setForm((f) => {
      if (!f) return f;
      const next = [...f.management_months_columns];
      next[idx] = value;
      return { ...f, management_months_columns: next };
    });
  }

  function removeColumn(idx: number) {
    if (
      !confirm(
        "이 칸을 삭제할까요? 이미 등록된 구간들의 시작/종료 위치가 밀릴 수 있으니, 삭제 후 아래 목록에서 각 구간의 시작/종료 칸을 다시 확인해주세요."
      )
    )
      return;
    setForm((f) =>
      f ? { ...f, management_months_columns: f.management_months_columns.filter((_, i) => i !== idx) } : f
    );
  }

  function moveColumn(idx: number, direction: -1 | 1) {
    setForm((f) => {
      if (!f) return f;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= f.management_months_columns.length) return f;
      const next = [...f.management_months_columns];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return { ...f, management_months_columns: next };
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
      <h2 className="font-semibold text-neutral-800">개월차별 관리 — 간트 차트 칸 설정</h2>
      <p className="mt-1 text-sm text-neutral-500">
        공개 화면의 표 맨 위에 왼쪽부터 나열되는 칸 이름입니다. 이름을 자유롭게 바꿀 수 있고,
        6개월 과정 뒤에 &quot;수료 이후&quot;처럼 칸을 추가로 붙일 수도 있습니다. 아래 목록에서
        각 구간을 등록할 때 이 칸들 중 시작/종료 칸을 골라서 지정합니다.
      </p>

      <div className="mt-4 space-y-5">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700">칸 목록</label>
            <button
              type="button"
              onClick={addColumn}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              <Plus size={12} />
              칸 추가
            </button>
          </div>
          <p className="mb-2 text-xs text-neutral-400">
            칸을 삭제하거나 순서를 바꾸면, 이미 등록된 구간들의 시작/종료 위치가 바뀔 수
            있습니다. 삭제·순서 변경 후에는 아래 목록에서 각 구간의 시작/종료 칸을 다시
            확인해주세요.
          </p>
          <div className="space-y-1.5">
            {form.management_months_columns.map((col, idx, arr) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-6 shrink-0 text-center text-xs text-neutral-400">{idx + 1}</span>
                <input
                  type="text"
                  value={col}
                  onChange={(e) => updateColumn(idx, e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => moveColumn(idx, -1)}
                  disabled={idx === 0}
                  className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="앞으로"
                >
                  <span className="block text-xs leading-none">◀</span>
                </button>
                <button
                  type="button"
                  onClick={() => moveColumn(idx, 1)}
                  disabled={idx === arr.length - 1}
                  className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="뒤로"
                >
                  <span className="block text-xs leading-none">▶</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeColumn(idx)}
                  className="rounded p-1.5 text-red-400 hover:bg-red-50"
                  aria-label="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {form.management_months_columns.length === 0 && (
              <p className="text-sm text-neutral-400">
                칸이 없습니다. &quot;칸 추가&quot;로 최소 1개 이상 만들어주세요.
              </p>
            )}
          </div>
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
