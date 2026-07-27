import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, Heart, MessageSquare, Send, X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type VisualPhoto = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_enabled: boolean;
  comments_enabled: boolean;
  media_type: string;
};

type Comment = {
  id: string;
  photo_id: string;
  author_name: string;
  content: string;
  created_at: string;
  admin_reply: string | null;
  admin_reply_at: string | null;
};

const getSessionId = () => {
  let id = localStorage.getItem("visitor_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_session_id", id);
  }
  return id;
};

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};

const PhotoCard = ({
  photo,
  index,
  isInView,
  onOpen,
  likeCount,
  commentCount,
}: {
  photo: VisualPhoto;
  index: number;
  isInView: boolean;
  onOpen: () => void;
  likeCount: number;
  commentCount: number;
}) => {
  const isVideo = photo.media_type === "video";

  return (
    <motion.div
      className="overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
    >
      <div
        className="relative overflow-hidden group cursor-pointer bg-black"
        onClick={onOpen}
      >
        {isVideo ? (
          <>
            <video
              src={photo.image_url}
              className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={photo.image_url}
            alt={photo.title}
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
            <Heart className="w-4 h-4 fill-current" /> {likeCount}
          </span>
          <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
            <MessageSquare className="w-4 h-4 fill-current" /> {commentCount}
          </span>
        </div>
      </div>

      <div className="py-3 space-y-1">
        {photo.title && <p className="text-sm text-white font-medium">{photo.title}</p>}
        {photo.description && <p className="text-xs text-white/40">{photo.description}</p>}
      </div>
    </motion.div>
  );
};

const Lightbox = ({
  photos,
  activeIndex,
  onClose,
  onNext,
  onPrev,
  onCountsChange,
}: {
  photos: VisualPhoto[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCountsChange: () => void;
}) => {
  const activePhoto = photos[activeIndex];
  const isVideo = activePhoto.media_type === "video";
  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const sessionId = getSessionId();

  const fetchReactions = useCallback(async () => {
    const { data, count } = await supabase
      .from("photo_reactions")
      .select("*", { count: "exact" })
      .eq("photo_id", activePhoto.id)
      .eq("reaction_type", "like");
    setLikeCount(count || 0);
    setLiked((data || []).some((r: any) => r.session_id === sessionId));
  }, [activePhoto.id, sessionId]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("photo_comments")
      .select("*")
      .eq("photo_id", activePhoto.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data as unknown as Comment[]);
  }, [activePhoto.id]);

  useEffect(() => {
    fetchReactions();
    if (activePhoto.comments_enabled) fetchComments();
    else setComments([]);
  }, [fetchReactions, fetchComments, activePhoto.comments_enabled]);

  const toggleLike = async () => {
    if (liked) {
      await supabase.from("photo_reactions").delete()
        .eq("photo_id", activePhoto.id).eq("session_id", sessionId).eq("reaction_type", "like");
    } else {
      await supabase.from("photo_reactions").insert({
        photo_id: activePhoto.id, session_id: sessionId, reaction_type: "like",
      } as any);
    }
    await fetchReactions();
    onCountsChange();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await supabase.from("photo_comments").insert({
      photo_id: activePhoto.id,
      author_name: commentName.trim() || "Anonymous",
      content: commentText.trim(),
    } as any);
    setCommentText("");
    await fetchComments();
    onCountsChange();
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await mediaWrapRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-[60] p-2 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev / Next */}
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Instagram-style panel */}
      <div
        className="relative w-full max-w-6xl h-full md:h-[90vh] md:max-h-[900px] mx-4 md:mx-8 bg-neutral-950 md:rounded-lg overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media side */}
        <div
          ref={mediaWrapRef}
          className="relative flex-1 min-h-0 bg-black flex items-center justify-center md:border-r md:border-white/10"
        >
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                key={activePhoto.id}
                src={activePhoto.image_url}
                className={isFullscreen ? "w-screen h-screen object-contain" : "max-w-full max-h-full w-full h-full object-contain"}
                controls={false}
                autoPlay
                loop
                muted={muted}
                playsInline
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  if (v.paused) v.play(); else v.pause();
                }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
                className="absolute bottom-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <img
              src={activePhoto.image_url}
              alt={activePhoto.title}
              className={isFullscreen ? "w-screen h-screen object-contain" : "max-w-full max-h-full object-contain"}
            />
          )}

          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-[400px] md:flex-shrink-0 flex flex-col bg-neutral-950 border-t md:border-t-0 border-white/10 max-h-[45vh] md:max-h-none">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-semibold truncate">enzo</p>
              {activePhoto.title && (
                <p className="text-xs text-white/50 truncate">{activePhoto.title}</p>
              )}
            </div>
          </div>

          {/* Caption + Comments */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {activePhoto.description && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex-shrink-0" />
                <p className="text-sm text-white/90 leading-relaxed">
                  <span className="font-semibold mr-2">enzo</span>
                  {activePhoto.description}
                </p>
              </div>
            )}

            {activePhoto.comments_enabled ? (
              comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-white/70 text-lg font-semibold">No comments yet.</p>
                  <p className="text-white/40 text-xs mt-1">Start the conversation.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-white/70 text-xs font-semibold">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 leading-relaxed">
                        <span className="font-semibold mr-2">{comment.author_name}</span>
                        {comment.content}
                      </p>
                      <p className="text-[11px] text-white/40 mt-1">{timeAgo(comment.created_at)}</p>
                      {comment.admin_reply && (
                        <div className="mt-2 ml-2 pl-3 border-l border-white/15">
                          <p className="text-sm text-white/80 leading-relaxed">
                            <span className="font-semibold mr-2">enzo</span>
                            {comment.admin_reply}
                          </p>
                          {comment.admin_reply_at && (
                            <p className="text-[11px] text-white/40 mt-1">{timeAgo(comment.admin_reply_at)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )
            ) : (
              <p className="text-white/40 text-xs text-center py-6">Comments are disabled for this post.</p>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-white/10 px-5 pt-3">
            <div className="flex items-center gap-4 mb-1">
              <button onClick={toggleLike} aria-label="Like" className="transition-transform active:scale-90">
                <Heart className={`w-6 h-6 ${liked ? "text-red-500 fill-current" : "text-white hover:text-white/70"}`} />
              </button>
              {activePhoto.comments_enabled && (
                <MessageSquare className="w-6 h-6 text-white" />
              )}
            </div>
            <p className="text-sm text-white font-semibold">{likeCount} {likeCount === 1 ? "like" : "likes"}</p>
            <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider">
              {activeIndex + 1} / {photos.length}
            </p>
          </div>

          {/* Composer */}
          {activePhoto.comments_enabled && (
            <form onSubmit={submitComment} className="border-t border-white/10 px-5 py-3 space-y-2">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
              />
              <div className="flex items-center gap-2 border-t border-white/5 pt-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="text-sm font-semibold text-sky-400 hover:text-sky-300 disabled:text-sky-400/30 transition-colors"
                >
                  Post
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </motion.div>
  );
};

const Visual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [photos, setPhotos] = useState<VisualPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    const [{ data: reactions }, { data: comments }] = await Promise.all([
      supabase.from("photo_reactions").select("photo_id").eq("reaction_type", "like"),
      supabase.from("photo_comments").select("photo_id"),
    ]);
    const lc: Record<string, number> = {};
    (reactions || []).forEach((r: any) => { lc[r.photo_id] = (lc[r.photo_id] || 0) + 1; });
    setLikeCounts(lc);
    const cc: Record<string, number> = {};
    (comments || []).forEach((c: any) => { cc[c.photo_id] = (cc[c.photo_id] || 0) + 1; });
    setCommentCounts(cc);
  }, []);

  useEffect(() => {
    supabase
      .from("visual_photos")
      .select("*")
      .eq("is_enabled", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setPhotos(data as unknown as VisualPhoto[]);
        setLoading(false);
      });
    fetchCounts();
  }, [fetchCounts]);

  const openPhoto = (index: number) => setActiveIndex(index);
  const closePhoto = () => setActiveIndex(null);
  const nextPhoto = () =>
    setActiveIndex((prev) => (prev === null ? null : prev === photos.length - 1 ? 0 : prev + 1));
  const prevPhoto = () =>
    setActiveIndex((prev) => (prev === null ? null : prev === 0 ? photos.length - 1 : prev - 1));

  return (
    <section id="visual" className="py-24 lg:py-32 bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        <motion.div
          ref={ref}
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 block">visual.</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-6">
            Photography
          </h2>
          <p className="text-white/40 max-w-lg text-sm md:text-base leading-relaxed">
            Capturing moments through a lens. A visual diary of the world as I see it.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">Loading...</p>
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                isInView={isInView}
                onOpen={() => openPhoto(i)}
                likeCount={likeCounts[photo.id] || 0}
                commentCount={commentCounts[photo.id] || 0}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-20 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Camera className="w-12 h-12 text-white/20 mb-6" />
            <p className="text-white/30 text-sm tracking-wider uppercase">Coming Soon</p>
            <p className="text-white/20 text-xs mt-2">Photos will be showcased here</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <Lightbox
            photos={photos}
            activeIndex={activeIndex}
            onClose={closePhoto}
            onNext={nextPhoto}
            onPrev={prevPhoto}
            onCountsChange={fetchCounts}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Visual;
