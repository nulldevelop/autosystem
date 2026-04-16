"use client";

import { useCallback, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoDropzoneProps {
  value?: string | File;
  onChange: (value: string | File) => void;
  disabled?: boolean;
  organizationId?: string;
}

export function LogoDropzone({ value, onChange, disabled, organizationId }: LogoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : value instanceof File ? URL.createObjectURL(value) : null
  );
  const [uploading, setUploading] = useState(false);

  const onUpload = useCallback(async (file: File) => {
    // Se não tiver organizationId (criando nova), passamos o arquivo para o formulário
    if (!organizationId) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
      return;
    }

    // Se tiver ID (editando), fazemos o upload direto
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", organizationId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        onChange(data.url);
        setPreview(data.url);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      setUploading(false);
    }
  }, [organizationId, onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  };

  return (
    <div
      className={cn(
        "relative group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all duration-300",
        isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/10 bg-white/[0.02] hover:border-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        preview && "border-none"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {preview ? (
        <div className="relative w-full h-full rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <Image
            src={preview}
            alt="Logo Preview"
            fill
            className="object-contain p-4"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onChange("");
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="p-3 rounded-full bg-white/5 mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={24} className="text-primary" />
                </div>
                <p className="mb-1 text-sm text-white/60 font-bold">
                  Clique ou arraste a logo
                </p>
                <p className="text-xs text-white/20 uppercase tracking-widest font-black">
                  PNG, JPG ou SVG (Máx. 2MB)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={disabled || uploading}
          />
        </label>
      )}
    </div>
  );
}
