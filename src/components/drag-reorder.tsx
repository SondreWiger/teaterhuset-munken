"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  sort_order: number;
  published: boolean;
}

export function DragReorder({
  videos,
  teamId,
  teamName,
  onReorder,
}: {
  videos: Video[];
  teamId: string;
  teamName: string;
  onReorder: (teamId: string, newOrder: Video[]) => void;
}) {
  const [items, setItems] = useState(
    [...videos].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragging(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDragging(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[dragItem.current];
    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, draggedItem);

    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(null);
    setItems(newItems);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const orders = items.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      const res = await fetch("/api/admin/content/video/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });

      if (!res.ok) throw new Error("Kunne ikke lagre rekkefølge");

      onReorder(teamId, items.map((item, index) => ({ ...item, sort_order: index })));
      toast.success("Rekkefølge lagret!");
    } catch {
      toast.error("Kunne ikke lagre rekkefølge");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-medium text-muted">
          Rekkefølge for {teamName}
        </h5>
        <button
          onClick={saveOrder}
          disabled={saving}
          className="btn-gold rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {saving ? "Lagrer..." : "Lagre rekkefølge"}
        </button>
      </div>
      {items.map((video, index) => (
        <div
          key={video.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-grab active:cursor-grabbing transition-all ${
            dragging === index
              ? "bg-gold/10 border border-gold/20"
              : "bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05]"
          }`}
        >
          <svg
            className="w-4 h-4 text-muted shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
          <span className={`w-5 text-xs text-muted text-center`}>
            {index + 1}
          </span>
          <span className="flex-1 truncate">{video.title}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              video.published ? "bg-success" : "bg-muted"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
