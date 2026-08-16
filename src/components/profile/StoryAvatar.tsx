import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type Story = {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
};

const REACTIONS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

const getSessionId = () => {
  let id = localStorage.getItem("story_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("story_session_id", id);
  }
  return id;
};


const StoryAvatar = ({
  username,
  avatarUrl,
  displayName,
}: {
  username: string;
  avatarUrl: string;
  displayName: string;
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

  const hasStories = stories.length > 0;

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((p) => (p === null ? null : p >= stories.length - 1 ? null : p + 1)),
    [stories.length]
  );
  const prev = useCallback(() => setIndex((p) => (p === null || p === 0 ? p : p - 1)), []);

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
    if (stories[index]?.media_type === "video") return;
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [index, stories, next]);

  const active = index === null ? null : stories[index];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadReactions = useCallback(async (storyId: string) => {
    const sessionId = getSessionId();
    const { data } = await supabase
      .from("story_reactions" as any)
      .select("reaction, session_id")
      .eq("story_id", storyId);
    const rows = (data as unknown as { reaction: string; session_id: string }[]) || [];
    const c: Record<string, number> = {};
    rows.forEach((r) => { c[r.reaction] = (c[r.reaction] || 0) + 1; });
    setCounts(c);
    setMyReaction(rows.find((r) => r.session_id === sessionId)?.reaction ?? null);
  }, []);

  useEffect(() => {
    if (!active) {
      setCounts({});
      setMyReaction(null);
      return;
    }
    loadReactions(active.id);
  }, [active, loadReactions]);

  const react = async (emoji: string) => {
    if (!active) return;
    const sessionId = getSessionId();
    if (myReaction === emoji) {
      await supabase
        .from("story_reactions" as any)
        .delete()
        .eq("story_id", active.id)
        .eq("session_id", sessionId);
    } else {
      await supabase
        .from("story_reactions" as any)
        .upsert(
          { story_id: active.id, session_id: sessionId, reaction: emoji } as any,
          { onConflict: "story_id,session_id" }
        );
    }
    loadReactions(active.id);
  };


  return (
    <>
      <button
        type="button"
        onClick={() => hasStories && setIndex(0)}
        aria-label={hasStories ? `View ${username}'s stories` : displayName}
        className={`block rounded-full p-[3px] ${
          hasStories
            ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 cursor-pointer"
            : "bg-white/15 cursor-default"
        }`}
      >
        <span className="block p-[3px] rounded-full bg-black">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </span>
      </button>

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
              <div className="flex gap-1 px-3 pt-4">
                {stories.map((_, i) => (
                  <span
                    key={i}
                    className={`h-0.5 flex-1 rounded-full ${i <= (index ?? 0) ? "bg-white" : "bg-white/25"}`}
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

export default StoryAvatar;
