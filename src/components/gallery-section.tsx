"use client";

import { useState } from "react";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!images.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bilder</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelected(img.image_url)}
            className="group aspect-square rounded-xl overflow-hidden glass-card"
          >
            <img
              src={img.image_url}
              alt={img.caption || ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected}
              alt=""
              className="w-full rounded-2xl object-contain max-h-[85vh]"
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-white hover:bg-white/[0.12] transition-colors border border-white/[0.06]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
