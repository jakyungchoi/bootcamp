"use client";

// 범용 콘텐츠 관리 화면.
// - table 설정(필드 목록)만 넘겨주면 목록 조회 + 추가 + 수정 + 삭제 + 순서 변경 + 공개/비공개가
//   모두 동작하는 화면이 만들어진다. 관리자 페이지의 각 메뉴는 이 컴포넌트를 설정만 바꿔서 사용한다.

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ImageUploadField } from "./image-upload-field";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "image" | "string-list";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[]; // select 타입일 때 사용
  placeholder?: string;
  required?: boolean;
  helpText?: string;
};

export type ResourceCrudProps = {
  table: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
  orderable?: boolean; // "order" 컬럼 기준 순서 변경 버튼을 보여줄지 (기본 true)
  publishable?: boolean; // "is_published" 토글을 보여줄지 (기본 true)
  titleField?: string; // 목록에서 대표로 보여줄 필드 (기본: 첫 번째 필드)
  imageFolder?: string; // 이미지 업로드 시 사용할 스토리지 폴더명 (기본: table 이름)
};

type Row = Record<string, unknown> & { id: string; order?: number; is_published?: boolean };

function emptyFormValues(fields: FieldConfig[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "boolean") values[f.key] = true;
    else if (f.type === "string-list") values[f.key] = [];
    else if (f.type === "number") values[f.key] = 0;
    else values[f.key] = "";
  }
  return values;
}

export function ResourceCrud({
  table,
  title,
  description,
  fields,
  orderable = true,
  publishable = true,
  titleField,
  imageFolder,
}: ResourceCrudProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null); // null = 폼 닫힘, {} = 새로 추가
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const query = supabase.from(table).select("*");
    const { data, error: err } = orderable
      ? await query.order("order", { ascending: true })
      : await query;
    if (err) setError(err.message);
    else setRows((data as Row[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 목록을 여는 즉시 로딩 상태를 보여주기 위함
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  function openNew() {
    const values = emptyFormValues(fields);
    if (orderable) values.order = rows.length > 0 ? Math.max(...rows.map((r) => Number(r.order ?? 0))) + 1 : 1;
    if (publishable) values.is_published = true;
    setFormValues(values);
    setEditing({} as Row);
  }

  function openEdit(row: Row) {
    const values: Record<string, unknown> = {};
    for (const f of fields) {
      values[f.key] = row[f.key] ?? (f.type === "string-list" ? [] : "");
    }
    if (orderable) values.order = row.order ?? 0;
    if (publishable) values.is_published = row.is_published ?? true;
    setFormValues(values);
    setEditing(row);
  }

  async function handleSave() {
    if (!supabase) return;
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = { ...formValues };
    if (editing && editing.id) {
      const { error: err } = await supabase.from(table).update(payload).eq("id", editing.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from(table).insert(payload);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(row: Row) {
    if (!supabase) return;
    if (!confirm("정말 삭제하시겠어요? 되돌릴 수 없습니다.")) return;
    const { error: err } = await supabase.from(table).delete().eq("id", row.id);
    if (err) setError(err.message);
    else load();
  }

  async function togglePublish(row: Row) {
    if (!supabase) return;
    const { error: err } = await supabase
      .from(table)
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (err) setError(err.message);
    else load();
  }

  async function move(row: Row, direction: -1 | 1) {
    if (!supabase) return;
    const idx = rows.findIndex((r) => r.id === row.id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= rows.length) return;
    const target = rows[targetIdx];
    const a = row.order ?? 0;
    const b = target.order ?? 0;
    const { error: err1 } = await supabase.from(table).update({ order: b }).eq("id", row.id);
    const { error: err2 } = await supabase.from(table).update({ order: a }).eq("id", target.id);
    if (err1 || err2) setError((err1 ?? err2)?.message ?? "순서 변경에 실패했습니다.");
    else load();
  }

  const primaryField = titleField ?? fields[0]?.key;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} />
          새로 추가
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-neutral-400">
            <Loader2 className="animate-spin" size={18} /> 불러오는 중...
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-400">
            아직 등록된 항목이 없습니다. &quot;새로 추가&quot; 버튼으로 첫 항목을 만들어보세요.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-neutral-100">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-neutral-50">
                  <td className="w-24 px-4 py-3 align-top text-neutral-400">
                    {orderable && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => move(row, -1)}
                          disabled={idx === 0}
                          className="rounded p-1 hover:bg-neutral-200 disabled:opacity-30"
                          aria-label="위로"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(row, 1)}
                          disabled={idx === rows.length - 1}
                          className="rounded p-1 hover:bg-neutral-200 disabled:opacity-30"
                          aria-label="아래로"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top font-medium text-neutral-800">
                    {String(row[primaryField] ?? "")}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {publishable && (
                      <button
                        type="button"
                        onClick={() => togglePublish(row)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.is_published
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        {row.is_published ? "공개" : "비공개"}
                      </button>
                    )}
                  </td>
                  <td className="w-24 px-4 py-3 text-right align-top">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded p-1.5 text-neutral-500 hover:bg-neutral-200"
                        aria-label="수정"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-50"
                        aria-label="삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">
              {editing.id ? "수정" : "새로 추가"}
            </h3>
            <div className="mt-4 space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    {f.label}
                    {f.required && <span className="text-red-400"> *</span>}
                  </label>
                  {f.type === "text" && (
                    <input
                      type="text"
                      value={String(formValues[f.key] ?? "")}
                      placeholder={f.placeholder}
                      onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                  )}
                  {f.type === "number" && (
                    <input
                      type="number"
                      value={Number(formValues[f.key] ?? 0)}
                      onChange={(e) =>
                        setFormValues((v) => ({ ...v, [f.key]: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                  )}
                  {f.type === "textarea" && (
                    <textarea
                      value={String(formValues[f.key] ?? "")}
                      placeholder={f.placeholder}
                      rows={3}
                      onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                  )}
                  {f.type === "string-list" && (
                    <textarea
                      value={
                        Array.isArray(formValues[f.key]) ? (formValues[f.key] as string[]).join("\n") : ""
                      }
                      placeholder={f.placeholder ?? "한 줄에 하나씩 입력하세요"}
                      rows={4}
                      onChange={(e) =>
                        setFormValues((v) => ({
                          ...v,
                          [f.key]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                  )}
                  {f.type === "select" && (
                    <select
                      value={String(formValues[f.key] ?? "")}
                      onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    >
                      <option value="">선택하세요</option>
                      {f.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {f.type === "boolean" && (
                    <label className="flex items-center gap-2 text-sm text-neutral-600">
                      <input
                        type="checkbox"
                        checked={Boolean(formValues[f.key])}
                        onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.checked }))}
                      />
                      사용함
                    </label>
                  )}
                  {f.type === "image" && (
                    <ImageUploadField
                      value={(formValues[f.key] as string | null) ?? null}
                      onChange={(url) => setFormValues((v) => ({ ...v, [f.key]: url }))}
                      folder={imageFolder ?? table}
                    />
                  )}
                  {f.helpText && <p className="mt-1 text-xs text-neutral-400">{f.helpText}</p>}
                </div>
              ))}

              {publishable && (
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={Boolean(formValues.is_published)}
                    onChange={(e) =>
                      setFormValues((v) => ({ ...v, is_published: e.target.checked }))
                    }
                  />
                  공개 (체크 해제하면 방문자에게 보이지 않습니다)
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
