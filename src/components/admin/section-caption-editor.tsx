"use client";

// 공개 페이지의 섹션 제목 바로 아래에 표시되는 한 줄 설명(캡션)을 관리자 화면에서 바로
// 수정하는 공용 UI. site_settings 테이블의 텍스트 컬럼 하나를 그대로 읽고 쓴다.
// (예: "협업 사례" 섹션 설명, "이런 협업이 가능해요" 섹션 설명, "기업 참여 방식" 섹션 설명)

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export type SectionCaptionEditorProps = {
  column: string; // site_settings 테이블의 텍스트 컬럼명
  title: string; // 안내 문구 상단에 보여줄, 이 섹션의 현재 이름
  onSaved?: () => void;
};

export function SectionCaptionEditor({ column, title, onSaved }: SectionCaptionEditorProps) {
  const [value, setValue] = useState("");
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
      const { data, error: err } = await supabase
        .from("site_settings")
        .select(column)
        .eq("id", 1)
        .maybeSingle();
      if (err) setError(err.message);
      else setValue(((data as Record<string, unknown> | null)?.[column] as string | undefined) ?? "");
      setLoading(false);
    }
    load();
  }, [column]);

  async function handleSave() {
    if (!supabase) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase
      .from("site_settings")
      .update({ [column]: value })
      .eq("id", 1);
    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="font-semibold text-neutral-800">&quot;{title}&quot; 안내 문구</h2>
      <p className="mt-1 text-sm text-neutral-500">
        공개 화면에서 &quot;{title}&quot; 제목 바로 아래에 표시되는 한 줄 설명입니다.
      </p>
      {loading ? (
        <div className="mt-3 text-sm text-neutral-400">
          <Loader2 className="mr-1 inline animate-spin" size={14} /> 불러오는 중...
        </div>
      ) : (
        <div className="mt-3">
          <textarea
            value={value}
            rows={2}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            {saved && <span className="text-xs text-green-600">저장했습니다</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
