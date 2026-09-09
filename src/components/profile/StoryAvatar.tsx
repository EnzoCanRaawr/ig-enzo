import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Music2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMusicEmbed } from "@/lib/music";


export type Story = {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
};

const timeAgoShort = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
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
  noteStyle = "plain",
  noteColor,
  noteImageUrl,
  noteMusicUrl,
  noteMusicTitle,
}: {
  username: string;
  avatarUrl: string;
  displayName: string;
  noteText?: string | null;
  noteCreatedAt?: string | null;
  noteStyle?: string | null;
  noteColor?: string | null;
  noteImageUrl?: string | null;
  noteMusicUrl?: string | null;
  noteMusicTitle?: string | null;
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [notePlaying, setNotePlaying] = useState(false);
  const noteEmbed = getMusicEmbed(noteMusicUrl);

  const style = noteStyle || "plain";
  const bubbleClass =
    style === "rgb"
      ? "note-rgb note-glow"
      : style === "glow"
      ? "bg-white text-black note-glow"
      : style === "shimmer"
      ? "note-shimmer"
      : style === "dark"
      ? "bg-neutral-900 text-white border border-white/20"
      : style === "color"
      ? "text-black"
      : "bg-white text-black";
  const bubbleStyle =
    style === "color" && noteColor ? { backgroundColor: noteColor } : undefined;
  const tailClass =
    style === "rgb"
      ? "note-rgb"
      : style === "shimmer"
      ? "note-shimmer"
      : style === "dark"
      ? "bg-neutral-900"
      : style === "color"
      ? ""
      : "bg-white";

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
    (!!noteText || !!noteImageUrl) &&
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
          <div className="absolute -top-2 md:-top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-8 z-20 max-w-[70vw]">
            <div
              className={`relative w-max max-w-[150px] sm:max-w-[190px] md:max-w-[230px] rounded-2xl px-3 py-1.5 shadow-lg ${bubbleClass}`}
              style={bubbleStyle}
            >
              {noteImageUrl && (
                <img
                  src={noteImageUrl}
                  alt=""
                  className="w-full max-h-24 object-cover rounded-xl mb-1.5 select-none"
                  draggable={false}
                />
              )}
              <p className="text-[11px] md:text-xs leading-snug break-words whitespace-pre-wrap">{noteText}</p>
              {noteEmbed?.embedUrl && (
                <button
                  type="button"
                  onClick={() => setNotePlaying((p) => !p)}
                  className="mt-1.5 flex items-center gap-1.5 text-[10px] md:text-[11px] font-medium opacity-80 hover:opacity-100"
                >
                  {notePlaying ? <Volume2 className="w-3 h-3" /> : <Music2 className="w-3 h-3" />}
                  <span className="truncate max-w-[130px]">{noteMusicTitle || "Play sound"}</span>
                </button>
              )}
              <span className={`absolute -bottom-1 left-4 w-2.5 h-2.5 rounded-full ${tailClass}`} style={bubbleStyle} />
              <span className={`absolute -bottom-3 left-2 w-1.5 h-1.5 rounded-full ${tailClass}`} style={bubbleStyle} />
            </div>
            {notePlaying && noteEmbed?.embedUrl && (
              <iframe
                title="Note sound"
                src={noteEmbed.embedUrl}
                allow="autoplay; encrypted-media"
                className="absolute w-px h-px opacity-0 pointer-events-none"
              />
            )}
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
            className="fixed inset-0 z-[100] bg-black md:bg-black/95 flex items-center justify-center overscroll-none"
          >
            <div className="relative w-full h-[100dvh] md:h-[min(92vh,880px)] md:w-auto md:aspect-[9/16] md:rounded-2xl overflow-hidden bg-black flex flex-col shadow-2xl">
              <button
                onClick={close}
                className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-30 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white"
                aria-label="Close story"
              >
                <X className="w-5 h-5" />
              </button>
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
                    className="w-full h-full object-contain md:object-contain pointer-events-none"
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
                className="absolute left-0 top-20 bottom-28 w-1/3 z-10"
              />
              <button
                onClick={next}
                aria-label="Next story"
                className="absolute right-0 top-20 bottom-28 w-2/3 z-10"
              />

              {/* Top gradient + progress + header */}
              <div className="relative z-20 bg-gradient-to-b from-black/75 to-transparent pb-8 pt-[env(safe-area-inset-top)]">
                <div className="flex gap-1 px-3 pt-3">
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

                <div className="flex items-center gap-2.5 px-3 md:px-4 py-2.5">
                  <img src={avatarUrl} alt={username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <span className="text-sm text-white font-semibold truncate max-w-[45%]">{username}</span>
                  <span className="text-[11px] text-white/50 flex-shrink-0">{timeAgoShort(active.created_at)}</span>
                  {active.media_type === "video" && (
                    <button
                      onClick={() => setMuted((m) => !m)}
                      aria-label={muted ? "Unmute story" : "Mute story"}
                      className="ml-auto mr-11 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
                    >
                      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1" />

              {/* Bottom: caption + reactions */}
              <div className="relative z-20 bg-gradient-to-t from-black/85 to-transparent pt-10 px-3 md:px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {active.caption && (
                  <p className="text-sm text-white/90 text-center mb-3 line-clamp-3">{active.caption}</p>
                )}
                <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => react(emoji)}
                      aria-label={`React ${emoji}`}
                      className={`flex-shrink-0 flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-2 text-base leading-none transition-all ${
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
                className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white z-30"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {index < stories.length - 1 && (
              <button
                onClick={next}
                className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white z-30"
                aria-label="Next story"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoryAvatar;
