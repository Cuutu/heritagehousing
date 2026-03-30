"use client";

import { useEffect, useState } from "react";
import { UploadButton } from "@/lib/uploadthing-react";
import type { OurFileRouter } from "@/app/api/uploadthing/uploadthing-router";
import Image from "next/image";
import { X } from "lucide-react";

export interface ImageItem {
  url: string;
  order: number;
}

interface Props {
  endpoint: keyof OurFileRouter;
  initialImages?: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export function ImageUploader({
  endpoint,
  initialImages = [],
  onChange,
}: Props) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleUploadComplete = (res: { url: string }[]) => {
    const newImages = [
      ...images,
      ...res.map((file, i) => ({
        url: file.url,
        order: images.length + i,
      })),
    ];
    setImages(newImages);
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }));
    setImages(updated);
    onChange(updated);
  };

  const moveImage = (from: number, to: number) => {
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    const reordered = updated.map((img, i) => ({ ...img, order: i }));
    setImages(reordered);
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, index) => (
          <div
            key={`${index}-${img.url}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
          >
            <Image
              src={img.url}
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                Portada
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-1 left-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  className="flex-1 rounded bg-black/60 py-0.5 text-[10px] text-white"
                >
                  ←
                </button>
              )}
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  className="flex-1 rounded bg-black/60 py-0.5 text-[10px] text-white"
                >
                  →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <UploadButton
        endpoint={endpoint}
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(err) => {
          window.alert(`Error al subir: ${err.message}`);
        }}
        appearance={{
          button:
            "bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors",
          allowedContent: "text-gray-500 text-xs mt-1",
        }}
        content={{
          button: "Subir imágenes",
          allowedContent: "JPG, PNG hasta 4MB · máx 20 fotos",
        }}
      />

      <p className="text-xs text-gray-400">
        La primera imagen es la portada. Usá las flechas para reordenar.
      </p>
    </div>
  );
}
