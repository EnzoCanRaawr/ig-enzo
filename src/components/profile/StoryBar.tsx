import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type Story = {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
};

const StoryBar = ({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string;
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("stories" as any)
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .then(({ data }) => setStories((data as unknown as Story[]) || []));
  }, []);

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((p) => (p === null ? null : p >= stories.length - 1 ? null : p + 1)),
    [stories.length]
  );
  const prev = useCallback(
    () => setIndex((p) => (p === null || p === 0 ? p : p - 1)),
    []
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, next, prev]);

  useEffect(() => {
    if (index === null) return;
    const story = stories[index];
    if (story?.media_type === "video") return;
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [index, stories, next]);

  if (stories.length === 0) return null;

  const active = index === null ? null : stories[index];

  return (
    <>
      <div className="flex items-center gap-5 overflow-x-auto pb-6 pt-2">
        {stories.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <span className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600">
              <span className="block p-[2px] rounded-full bg-black">
                {s.media_type === "video" ? (
                  <video
                    src={s.media_url}
                    muted
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <img
                    src={s.media_url}
                    alt={s.caption || "Story"}
                    className="w-16 h-16 rounded-full object-cover"
                    draggable={false}
                  />
                )}
              </span>
            </span>
            <span className="text-[10px] text-white/50 max-w-[4.5rem] truncate">
              {s.caption || username}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          >
            <button
              onClick={close}
              className="absolute top-5 right-5 text-white/60 hover:text-white"
              aria-label="Close story"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-md h-full md:h-[85vh] flex flex-col">
              {/* progress */}
              <div className="flex gap-1 px-3 pt-4">
                {stories.map((_, i) => (
                  <span
                    key={i}
                    className={`h-0.5 flex-1 rounded-full ${
                      i <= (index ?? 0) ? "bg-white" : "bg-white/25"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 px-4 py-3">
                <img src={avatarUrl} alt={username} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm text-white">{username}</span>
              </div>

              <div className="flex-1 flex items-center justify-center overflow-hidden">
                {active.media_type === "video" ? (
                  <video
                    key={active.id}
                    src={active.media_url}
                    autoPlay
                    controls
                    onEnded={next}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    key={active.id}
                    src={active.media_url}
                    alt={active.caption || "Story"}
                    className="max-h-full max-w-full object-contain select-none"
                    draggable={false}
                  />
                )}
              </div>

              {active.caption && (
                <p className="px-5 py-4 text-sm text-white/80 text-center">{active.caption}</p>
              )}
            </div>

            {index !== null && index > 0 && (
              <button
                onClick={prev}
                className="absolute left-3 md:left-10 text-white/50 hover:text-white"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            <button
              onClick={next}
              className="absolute right-3 md:right-10 text-white/50 hover:text-white"
              aria-label="Next story"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoryBar;
