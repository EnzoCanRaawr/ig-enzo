import { motion } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Heart, MessageCircle, X, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Volume2, VolumeX, Music2, Play, Pause,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMusicEmbed } from "@/lib/music";
import { Post, PostComment, postMedia, isVideoPost, getSessionId, timeAgo } from "./postTypes";

const PostLightbox = ({
  posts,
  activeIndex,
  username,
  avatarUrl,
  onClose,
  onNext,
  onPrev,
  onCountsChange,
}: {
  posts: Post[];
  activeIndex: number;
  username: string;
  avatarUrl?: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCountsChange: () => void;
}) => {
  const post = posts[activeIndex];
  const media = postMedia(post);
  const isVideo = isVideoPost(post);
  const embed = getMusicEmbed(post.music_url);
  const hasAudio = !!(post.music_url && embed?.embedUrl);

  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [slide, setSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(hasAudio);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const sessionId = getSessionId();

  // Reset per post; audio starts automatically when the post has a track
  useEffect(() => {
    setSlide(0);
    setAudioPlaying(hasAudio);
  }, [post.id, hasAudio]);

  const fetchReactions = useCallback(async () => {
    const { data, count } = await supabase
      .from("photo_reactions")
      .select("*", { count: "exact" })
      .eq("photo_id", post.id)
      .eq("reaction_type", "like");
    setLikeCount(count || 0);
    setLiked((data || []).some((r: any) => r.session_id === sessionId));
  }, [post.id, sessionId]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("photo_comments")
      .select("*")
      .eq("photo_id", post.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data as unknown as PostComment[]);
  }, [post.id]);

  useEffect(() => {
    fetchReactions();
    if (post.comments_enabled) fetchComments();
    else setComments([]);
  }, [fetchReactions, fetchComments, post.comments_enabled]);

  const toggleLike = async () => {
    if (liked) {
      await supabase.from("photo_reactions").delete()
        .eq("photo_id", post.id).eq("session_id", sessionId).eq("reaction_type", "like");
    } else {
      await supabase.from("photo_reactions").insert({
        photo_id: post.id, session_id: sessionId, reaction_type: "like",
      } as any);
    }
    await fetchReactions();
    onCountsChange();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await supabase.from("photo_comments").insert({
      photo_id: post.id,
      author_name: commentName.trim() || "Anonymous",
      content: commentText.trim(),
    } as any);
    setCommentText("");
    await fetchComments();
    onCountsChange();
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await mediaWrapRef.current?.requestFullscreen();
      else await document.exitFullscreen();
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

  const Avatar = ({ size = "w-8 h-8" }: { size?: string }) =>
    avatarUrl ? (
      <img src={avatarUrl} alt={username} className={`${size} rounded-full object-cover flex-shrink-0`} draggable={false} />
    ) : (
      <div className={`${size} rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex-shrink-0`} />
    );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black/95 md:backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Hidden audio player: plays the linked track without showing an embed */}
      {hasAudio && audioPlaying && (
        <iframe
          key={`${post.id}-audio`}
          src={embed!.embedUrl!}
          title="Post audio"
          className="absolute w-px h-px opacity-0 pointer-events-none -z-10"
          allow="autoplay; encrypted-media"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      <button
        className="hidden md:block absolute top-4 right-4 z-[60] p-2 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {posts.length > 1 && (
        <>
          <button
            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous post"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next post"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full md:h-[88vh] md:max-h-[860px] md:w-full md:max-w-6xl md:mx-8 bg-black md:bg-neutral-950 md:rounded-xl overflow-hidden flex flex-col md:flex-row md:border md:border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-3 h-14 border-b border-white/10 flex-shrink-0">
          <button onClick={onClose} aria-label="Back" className="p-1 -ml-1 text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <Avatar />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white font-semibold truncate">{username}</p>
            {post.title && <p className="text-[11px] text-white/50 truncate">{post.title}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 text-white/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media */}
        <div
          ref={mediaWrapRef}
          className="relative bg-black flex items-center justify-center flex-shrink-0 md:flex-shrink md:flex-1 md:min-w-0 aspect-square md:aspect-auto md:h-full md:border-r md:border-white/10"
        >
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                key={post.id}
                src={media[0]}
                className={isFullscreen ? "w-screen h-screen object-contain" : "w-full h-full object-contain"}
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
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <img
              src={media[slide]}
              alt={post.title || "Post"}
              className={isFullscreen ? "w-screen h-screen object-contain" : "w-full h-full object-contain"}
              draggable={false}
            />
          )}

          {/* Carousel controls */}
          {!isVideo && media.length > 1 && (
            <>
              {slide > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSlide((s) => s - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/85 text-black hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {slide < media.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSlide((s) => s + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/85 text-black hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {media.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === slide ? "bg-white" : "bg-white/35"}`}
                  />
                ))}
              </div>
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px]">
                {slide + 1}/{media.length}
              </span>
            </>
          )}

          {/* Audio ribbon — toggles playback, no visible embed */}
          {post.music_url && (
            <button
              onClick={(e) => { e.stopPropagation(); setAudioPlaying((v) => !v); }}
              className="absolute bottom-3 left-3 flex items-center gap-2 max-w-[70%] px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
              aria-label={audioPlaying ? "Pause audio" : "Play audio"}
            >
              {audioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <Music2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs truncate">{post.music_title || "Original audio"}</span>
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col flex-1 min-h-0 md:flex-none md:w-[400px] bg-black md:bg-neutral-950">
          {/* Desktop header */}
          <div className="hidden md:flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <Avatar />
            <div className="min-w-0">
              <p className="text-sm text-white font-semibold truncate">{username}</p>
              {post.title && <p className="text-xs text-white/50 truncate">{post.title}</p>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-4">
            {post.description && (
              <div className="flex gap-3">
                <Avatar />
                <p className="text-sm text-white/90 leading-relaxed">
                  <span className="font-semibold mr-2">{username}</span>
                  {post.description}
                </p>
              </div>
            )}

            {post.comments_enabled ? (
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
                            <span className="font-semibold mr-2">{username}</span>
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
              <p className="text-white/40 text-xs text-center py-6">Comments are turned off for this post.</p>
            )}
          </div>

          <div className="border-t border-white/10 px-4 md:px-5 pt-3">
            <div className="flex items-center gap-4 mb-1">
              <button onClick={toggleLike} aria-label="Like" className="transition-transform active:scale-90">
                <Heart className={`w-6 h-6 ${liked ? "text-red-500 fill-current" : "text-white hover:text-white/70"}`} />
              </button>
              {post.comments_enabled && <MessageCircle className="w-6 h-6 text-white" />}
              {posts.length > 1 && (
                <div className="ml-auto flex items-center gap-1 md:hidden">
                  <button onClick={onPrev} aria-label="Previous post" className="p-1 text-white/60">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={onNext} aria-label="Next post" className="p-1 text-white/60">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-white font-semibold">{likeCount} {likeCount === 1 ? "like" : "likes"}</p>
            <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider">
              {activeIndex + 1} / {posts.length}
            </p>
          </div>

          {post.comments_enabled && (
            <form onSubmit={submitComment} className="border-t border-white/10 px-4 md:px-5 py-3 space-y-2">
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

export default PostLightbox;
