import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
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
const IMAGE_DURATION = 5000;

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
  noteText,
  noteCreatedAt,
}: {
  username: string;
  avatarUrl: string;
  displayName: string;
  noteText?: string | null;
  noteCreatedAt?: string | null;
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadStories = useCallback(async () => {
    const { data } = await supabase
      .from("stories" as any)
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });
    setStories((data as unknown as Story[]) || []);
  }, []);

  useEffect(() => {
    loadStories();
    const t = setInterval(loadStories, 60000);
    return () => clearInterval(t);
  }, [loadStories]);

  const hasStories = stories.length > 0;
  const noteFresh =
    !!noteText &&
    (!noteCreatedAt || Date.now() - new Date(noteCreatedAt).getTime() < 24 * 60 * 60 * 1000);

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

  const active = index === null ? null : stories[index];

  // Progress for photos (videos drive their own progress via timeupdate)
  useEffect(() => {
    setProgress(0);
    if (!active || active.media_type === "video") return;
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(1, (Date.now() - start) / IMAGE_DURATION);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(tick);
        next();
      }
    }, 60);
    return () => clearInterval(tick);
  }, [active, next]);

  const loadReactions = useCallback(async (storyId: string) => {
    const sessionId = getSessionId();
    const { data } = await supabase
      .from("story_reactions" as any)
      .select("reaction, session_id")
      .eq("story_id", storyId);
    const rows = (data as unknown as { reaction: string; session_id: string }[]) || [];
    const c: Record<string, number> = {};
    rows.forEach((r) => {
      c[r.reaction] = (c[r.reaction] || 0) + 1;
    });
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
      <div className="relative">
        {noteFresh && (
          <div className="absolute -top-3 md:-top-5 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-6 z-20 pointer-events-none">
            <div className="relative max-w-[150px] rounded-2xl bg-white text-black px-3 py-1.5 shadow-lg">
              <p className="text-[11px] md:text-xs leading-snug break-words">{noteText}</p>
              <span className="absolute -bottom-1 left-4 w-2.5 h-2.5 rounded-full bg-white" />
              <span className="absolute -bottom-3 left-2 w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        )}

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
              className="w-[86px] h-[86px] md:w-[168px] md:h-[168px] rounded-full object-cover select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </span>
        </button>
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
              className="absolute top-4 right-4 z-30 text-white/70 hover:text-white"
              aria-label="Close story"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-full md:w-auto md:h-[92vh] md:aspect-[9/16] md:rounded-xl overflow-hidden bg-black flex flex-col">
              {/* Media fills the frame */}
              <div className="absolute inset-0">
                {active.media_type === "video" ? (
                  <video
                    key={active.id}
                    ref={videoRef}
                    src={active.media_url}
                    autoPlay
                    muted={muted}
                    playsInline
                    onEnded={next}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration) setProgress(v.currentTime / v.duration);
                    }}
                    onPause={() => videoRef.current?.play().catch(() => {})}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <img
                    key={active.id}
                    src={active.media_url}
                    alt={active.caption || "Story"}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                )}
              </div>

              {/* Tap zones */}
              <button
                onClick={prev}
                aria-label="Previous story"
                className="absolute left-0 top-16 bottom-32 w-1/3 z-10"
              />
              <button
                onClick={next}
                aria-label="Next story"
                className="absolute right-0 top-16 bottom-32 w-1/3 z-10"
              />

              {/* Top gradient + progress + header */}
              <div className="relative z-20 bg-gradient-to-b from-black/70 to-transparent pb-8">
                <div className="flex gap-1 px-3 pt-4">
                  {stories.map((_, i) => (
                    <span key={i} className="h-0.5 flex-1 rounded-full bg-white/25 overflow-hidden">
                      <span
                        className="block h-full bg-white"
                        style={{
                          width:
                            i < (index ?? 0) ? "100%" : i === index ? `${progress * 100}%` : "0%",
                        }}
                      />
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <img src={avatarUrl} alt={username} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm text-white font-medium">{username}</span>
                  <span className="text-xs text-white/50">
                    {new Date(active.created_at).toLocaleDateString()}
                  </span>
                  {active.media_type === "video" && (
                    <button
                      onClick={() => setMuted((m) => !m)}
                      aria-label={muted ? "Unmute story" : "Mute story"}
                      className="ml-auto mr-8 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
                    >
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1" />

              {/* Bottom: caption + reactions */}
              <div className="relative z-20 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-5 px-4">
                {active.caption && (
                  <p className="text-sm text-white/90 text-center mb-4">{active.caption}</p>
                )}
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => react(emoji)}
                      aria-label={`React ${emoji}`}
                      className={`flex items-center gap-1 rounded-full px-3 py-2 text-base leading-none transition-all ${
                        myReaction === emoji ? "bg-white/25 scale-110" : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <span>{emoji}</span>
                      {counts[emoji] ? (
                        <span className="text-xs text-white/70">{counts[emoji]}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {index > 0 && (
              <button
                onClick={prev}
                className="hidden md:block absolute left-6 text-white/50 hover:text-white z-30"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            <button
              onClick={next}
              className="hidden md:block absolute right-6 text-white/50 hover:text-white z-30"
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
