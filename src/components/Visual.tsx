import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, Heart, MessageSquare, Send, X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type VisualPhoto = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_enabled: boolean;
  comments_enabled: boolean;
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

const PhotoCard = ({
  photo,
  index,
  isInView,
  onOpen,
}: {
  photo: VisualPhoto;
  index: number;
  isInView: boolean;
  onOpen: () => void;
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const sessionId = getSessionId();

  const fetchReactions = useCallback(async () => {
    const { data, count } = await supabase
      .from("photo_reactions")
      .select("*", { count: "exact" })
      .eq("photo_id", photo.id)
      .eq("reaction_type", "like");
    setLikeCount(count || 0);
    const userLiked = (data || []).some((r: any) => r.session_id === sessionId);
    setLiked(userLiked);
  }, [photo.id, sessionId]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("photo_comments")
      .select("*")
      .eq("photo_id", photo.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data as unknown as Comment[]);
  }, [photo.id]);

  useEffect(() => {
    fetchReactions();
    if (photo.comments_enabled) fetchComments();
  }, [fetchReactions, fetchComments, photo.comments_enabled]);

  const toggleLike = async () => {
    if (liked) {
      await supabase.from("photo_reactions").delete()
        .eq("photo_id", photo.id).eq("session_id", sessionId).eq("reaction_type", "like");
    } else {
      await supabase.from("photo_reactions").insert({
        photo_id: photo.id, session_id: sessionId, reaction_type: "like",
      } as any);
    }
    fetchReactions();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await supabase.from("photo_comments").insert({
      photo_id: photo.id,
      author_name: commentName.trim() || "Anonymous",
      content: commentText.trim(),
    } as any);
    setCommentText("");
    fetchComments();
  };

  return (
    <motion.div
      className="overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
    >
      <div
        className="relative overflow-hidden group cursor-pointer"
        onClick={onOpen}
      >
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      <div className="py-3 space-y-1">
        {photo.title && <p className="text-sm text-white font-medium">{photo.title}</p>}
        {photo.description && <p className="text-xs text-white/40">{photo.description}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? "text-red-400" : "text-white/30 hover:text-white/60"}`}>
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-xs">{likeCount}</span>
          </button>
          {photo.comments_enabled && (
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{comments.length}</span>
            </button>
          )}
        </div>

        {photo.comments_enabled && showComments && (
          <div className="pt-3 space-y-3 border-t border-white/10 mt-3">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-1.5">
                <div className="space-y-0.5">
                  <p className="text-xs">
                    <span className="text-white/60 font-medium">{comment.author_name}</span>
                    <span className="text-white/20 ml-2">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </p>
                  <p className="text-xs text-white/40">{comment.content}</p>
                </div>
                {comment.admin_reply && (
                  <div className="ml-4 pl-3 border-l border-white/15">
                    <p className="text-[10px] text-white/25 mb-0.5">
                      Admin · {comment.admin_reply_at ? new Date(comment.admin_reply_at).toLocaleDateString() : ""}
                    </p>
                    <p className="text-xs text-white/50">{comment.admin_reply}</p>
                  </div>
                )}
              </div>
            ))}
            <form onSubmit={submitComment} className="space-y-2">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full bg-transparent border border-white/10 px-3 py-2 text-xs text-white focus:border-white/30 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-transparent border border-white/10 px-3 py-2 text-xs text-white focus:border-white/30 outline-none"
                />
                <button type="submit" className="p-2 text-white/30 hover:text-white/60 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
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
}: {
  photos: VisualPhoto[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const activePhoto = photos[activeIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
      <button
        className="absolute top-4 right-4 z-50 p-2 text-white/60 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white/60 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white/60 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={activePhoto.image_url}
          alt={activePhoto.title}
          className="max-w-full max-h-[80vh] object-contain"
        />
        {(activePhoto.title || activePhoto.description) && (
          <div className="mt-4 text-center max-w-xl px-4">
            {activePhoto.title && (
              <p className="text-white font-medium text-sm md:text-base">{activePhoto.title}</p>
            )}
            {activePhoto.description && (
              <p className="text-white/50 text-xs md:text-sm mt-1">{activePhoto.description}</p>
            )}
          </div>
        )}
        <p className="text-white/30 text-xs mt-2">
          {activeIndex + 1} / {photos.length}
        </p>
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
  }, []);

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

      {activeIndex !== null && (
        <Lightbox
          photos={photos}
          activeIndex={activeIndex}
          onClose={closePhoto}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
      )}
    </section>
  );
};

export default Visual;
