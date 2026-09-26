"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ResourceCrud } from "@/components/admin/resource-crud";
import { PageHeaderNote } from "@/components/admin/page-header-note";
import { useAdminMenuLabel } from "@/components/admin/admin-menu-context";

export default function CompanyFlowAdminPage() {
  const title = useAdminMenuLabel("company-flow", "이런 협업이 가능해요");

  // 공개 화면에서 이 섹션 제목 바로 아래에 표시되는 한 줄 설명(company_flow_description).
  // 예전에는 코드에 고정된 문구라 수정할 방법이 없었는데, 여기서 바로 고칠 수 있게 했다.
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data, error: err } = await supabase
        .from("site_settings")
        .select("company_flow_description")
        .eq("id", 1)
        .maybeSingle();
      if (err) setError(err.message);
      else setDescription(data?.company_flow_description ?? "");
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!supabase) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error: err } = await supabase
      .from("site_settings")
      .update({ company_flow_description: description })
      .eq("id", 1);
    setSaving(false);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div>
      <PageHeaderNote />

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
              value={description}
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
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

      <ResourceCrud
        table="company_flow_steps"
        title={title}
        description={`참여 기업 연계 페이지의 "${title}" 섹션에 표시되는 활동 목록입니다. 순서는 화면에 보이는 순서에만 영향을 줍니다.`}
        publishable={false}
        titleField="title"
        fields={[{ key: "title", label: "활동 이름", type: "text", required: true }]}
      />
    </div>
  );
}
