"use client";

// 범용 콘텐츠 관리 화면.
// - table 설정(필드 목록)만 넘겨주면 목록 조회 + 추가 + 수정 + 삭제 + 순서 변경 + 공개/비공개가
//   모두 동작하는 화면이 만들어진다. 관리자 페이지의 각 메뉴는 이 컴포넌트를 설정만 바꿔서 사용한다.

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ImageUploadField } from "./image-upload-field";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "image"
  | "string-list"
  | "object-list";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[]; // select 타입일 때 사용
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  // object-list 타입일 때 사용: 항목 하나(객체 하나)가 어떤 필드들로 이루어지는지 정의한다.
  // (text / textarea / image 만 지원 — 항목 안에 또 목록을 넣는 중첩은 지원하지 않는다)
  subFields?: FieldConfig[];
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
  // 저장/삭제/순서변경/공개전환이 성공할 때마다 호출된다. 옆에 실시간 미리보기를 붙인 화면에서
  // 이 콜백으로 미리보기를 새로고침한다. (최초 목록을 불러올 때는 호출하지 않는다)
  onSaved?: () => void;
};

type Row = Record<string, unknown> & { id: string; order?: number; is_published?: boolean };

function emptyFormValues(fields: FieldConfig[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "boolean") values[f.key] = true;
    else if (f.type === "string-list" || f.type === "object-list") values[f.key] = [];
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
  onSaved,
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

  // 저장/삭제/순서변경/공개전환처럼 실제로 데이터가 바뀌는 조작이 성공했을 때만 호출한다.
  // (최초 목록 조회는 데이터가 안 바뀌었으니 미리보기를 새로고침할 필요가 없다)
  async function reloadAfterChange() {
    await load();
    onSaved?.();
  }

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
      values[f.key] = row[f.key] ?? (f.type === "string-list" || f.type === "object-list" ? [] : "");
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
    for (const f of fields) {
      // string-list 필드는 입력 중엔 빈 줄도 그대로 두었으니, 저장 직전에 앞뒤 공백과 빈 줄을 정리한다.
      if (f.type === "string-list" && Array.isArray(payload[f.key])) {
        payload[f.key] = (payload[f.key] as string[]).map((s) => s.trim()).filter(Boolean);
      }
      // object-list 필드는 완전히 비어있는 항목(모든 값이 비어있는 항목)만 저장 시 정리한다.
      if (f.type === "object-list" && Array.isArray(payload[f.key])) {
        payload[f.key] = (payload[f.key] as Record<string, unknown>[])
          .map((item) => {
            const cleaned: Record<string, unknown> = {};
            for (const sf of f.subFields ?? []) {
              const v = item[sf.key];
              cleaned[sf.key] = typeof v === "string" ? v.trim() : (v ?? (sf.type === "image" ? null : ""));
            }
            return cleaned;
          })
          .filter((item) => Object.values(item).some((v) => v !== "" && v !== null));
      }
      // select 필드는 선택하지 않으면 빈 문자열인데, DB 컬럼이 uuid 등이면 빈 문자열은 저장할 수 없다.
      // (필수 항목이 아닌 select는 "선택 안 함"을 null로 저장한다)
      if (f.type === "select" && payload[f.key] === "") {
        payload[f.key] = null;
      }
    }
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
    reloadAfterChange();
  }

  async function handleDelete(row: Row) {
    if (!supabase) return;
    if (!confirm("정말 삭제하시겠어요? 되돌릴 수 없습니다.")) return;
    const { error: err } = await supabase.from(table).delete().eq("id", row.id);
    if (err) setError(err.message);
    else reloadAfterChange();
  }

  async function togglePublish(row: Row) {
    if (!supabase) return;
    const { error: err } = await supabase
      .from(table)
      .update({ is_published: !row.is_published })
      .eq("id", row.id);
    if (err) setError(err.message);
    else reloadAfterChange();
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
    else reloadAfterChange();
  }

  // object-list 필드(예: 과정 프로젝트 상세, 개월차 사진) 편집용 헬퍼
  function addObjectListItem(fieldKey: string, subFields: FieldConfig[]) {
    const empty: Record<string, unknown> = {};
    for (const sf of subFields) empty[sf.key] = sf.type === "image" ? null : "";
    setFormValues((v) => ({
      ...v,
      [fieldKey]: [...((v[fieldKey] as Record<string, unknown>[]) ?? []), empty],
    }));
  }

  function updateObjectListItem(fieldKey: string, idx: number, subKey: string, value: unknown) {
    setFormValues((v) => {
      const list = [...((v[fieldKey] as Record<string, unknown>[]) ?? [])];
      list[idx] = { ...list[idx], [subKey]: value };
      return { ...v, [fieldKey]: list };
    });
  }

  function removeObjectListItem(fieldKey: string, idx: number) {
    setFormValues((v) => {
      const list = [...((v[fieldKey] as Record<string, unknown>[]) ?? [])];
      list.splice(idx, 1);
      return { ...v, [fieldKey]: list };
    });
  }

  function moveObjectListItem(fieldKey: string, idx: number, direction: -1 | 1) {
    setFormValues((v) => {
      const list = [...((v[fieldKey] as Record<string, unknown>[]) ?? [])];
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= list.length) return v;
      [list[idx], list[targetIdx]] = [list[targetIdx], list[idx]];
      return { ...v, [fieldKey]: list };
    });
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
                    {String(
                      row[primaryField] || row.title || row.name || row.label || row.value || ""
                    )}
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
                        // 입력하는 도중에 바로 trim/빈 줄 제거를 하면, 줄바꿈을 누른 직후의
                        // "끝에 빈 줄 하나"가 곧바로 사라져서 줄바꿈 자체가 안 되는 것처럼 보인다.
                        // 그래서 입력 중에는 줄바꿈을 그대로 두고, 저장할 때(handleSave)만 정리한다.
                        setFormValues((v) => ({
                          ...v,
                          [f.key]: e.target.value.split("\n"),
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
                  {f.type === "object-list" && (
                    <div className="space-y-3">
                      {((formValues[f.key] as Record<string, unknown>[]) ?? []).map((item, idx, arr) => (
                        <div key={idx} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                              항목 {idx + 1}
                            </p>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveObjectListItem(f.key, idx, -1)}
                                disabled={idx === 0}
                                className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                                aria-label="위로"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveObjectListItem(f.key, idx, 1)}
                                disabled={idx === arr.length - 1}
                                className="rounded p-1 text-neutral-400 hover:bg-neutral-200 disabled:opacity-30"
                                aria-label="아래로"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeObjectListItem(f.key, idx)}
                                className="rounded p-1 text-red-400 hover:bg-red-50"
                                aria-label="삭제"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {(f.subFields ?? []).map((sf) => (
                              <div key={sf.key}>
                                <label className="mb-1 block text-xs font-medium text-neutral-500">
                                  {sf.label}
                                </label>
                                {sf.type === "image" ? (
                                  <ImageUploadField
                                    value={(item[sf.key] as string | null) ?? null}
                                    onChange={(url) => updateObjectListItem(f.key, idx, sf.key, url)}
                                    folder={imageFolder ?? table}
                                  />
                                ) : sf.type === "textarea" ? (
                                  <textarea
                                    value={String(item[sf.key] ?? "")}
                                    placeholder={sf.placeholder}
                                    rows={2}
                                    onChange={(e) => updateObjectListItem(f.key, idx, sf.key, e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={String(item[sf.key] ?? "")}
                                    placeholder={sf.placeholder}
                                    onChange={(e) => updateObjectListItem(f.key, idx, sf.key, e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addObjectListItem(f.key, f.subFields ?? [])}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                      >
                        <Plus size={13} />
                        항목 추가
                      </button>
                    </div>
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
