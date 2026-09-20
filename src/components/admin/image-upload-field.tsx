"use client";

// 이미지 업로드 입력. 파일을 고르면 Supabase Storage의 "media" 버킷에 올리고,
// 업로드가 끝나면 공개 URL을 value 로 돌려준다.

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type ImageUploadFieldProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string; // 스토리지 안에서 파일을 정리할 하위 폴더명 (예: "courses")
};

export function ImageUploadField({ value, onChange, folder }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!supabase) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <div className="flex h-24 w-40 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-2">
            <Image
              src={value}
              alt=""
              width={160}
              height={100}
              className="max-h-full max-w-full object-contain"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white shadow"
            aria-label="이미지 삭제"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex h-24 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-500">
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
          <span className="text-xs">{uploading ? "업로드 중..." : "이미지 선택"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
