import { motion } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Heart, MessageCircle, X, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Volume2, VolumeX, Music2, Play, Pause, Send, Bookmark, MoreHorizontal, Smile,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMusicEmbed } from "@/lib/music";
import { Post, PostComment, postMedia, isVideoPost, getSessionId, timeAgo } from "./postTypes";
import { toast } from "sonner";

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
  const commentInputRef = useRef<HTMLInputElement>(null);

  const [slide, setSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(hasAudio);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const sessionId = getSessionId();

  // Reset per post; audio starts automatically when the post has a track
  useEffect(() => {
    setSlide(0);
    setAudioPlaying(hasAudio);
    setSaved(localStorage.getItem(`post-saved-${post.id}`) === "true");
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

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    localStorage.setItem(`post-saved-${post.id}`, String(next));
  };

  const sharePost = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title || username, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user dismissed */
    }
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

  const ActionBar = () => (
    <div className="flex items-center gap-4">
      <button onClick={toggleLike} aria-label="Like" className="transition-transform active:scale-125">
        <Heart className={`w-7 h-7 ${liked ? "text-red-500 fill-current" : "text-white hover:text-white/60"}`} />
      </button>
      {post.comments_enabled && (
        <button
          onClick={() => commentInputRef.current?.focus()}
          aria-label="Comment"
          className="transition-transform active:scale-90"
        >
          <MessageCircle className="w-7 h-7 text-white hover:text-white/60 -scale-x-100" />
        </button>
      )}
      <button onClick={sharePost} aria-label="Share" className="transition-transform active:scale-90">
        <Send className="w-7 h-7 text-white hover:text-white/60" />
      </button>
      <button onClick={toggleSave} aria-label="Save" className="ml-auto transition-transform active:scale-90">
        <Bookmark className={`w-7 h-7 ${saved ? "text-white fill-current" : "text-white hover:text-white/60"}`} />
      </button>
    </div>
  );

  const LikeMeta = () => (
    <div className="mt-2">
      <p className="text-sm text-white font-semibold">{likeCount} {likeCount === 1 ? "like" : "likes"}</p>
      {post.created_at && (
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wide">{timeAgo(post.created_at)} ago</p>
      )}
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center bg-black md:bg-black/80 md:backdrop-blur-sm"
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
        <X className="w-7 h-7" />
      </button>

      {posts.length > 1 && (
        <>
          <button
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-[60] w-9 h-9 items-center justify-center rounded-full bg-white text-black hover:bg-white/80 transition-colors"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous post"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-[60] w-9 h-9 items-center justify-center rounded-full bg-white text-black hover:bg-white/80 transition-colors"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next post"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div
        className="relative w-full h-full md:h-[92vh] md:max-h-[880px] md:max-w-5xl md:mx-8 bg-black md:rounded-lg overflow-hidden flex flex-col md:flex-row md:border md:border-white/15 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top bar — IG style */}
        <div className="md:hidden flex items-center gap-3 px-2 h-14 border-b border-white/10 flex-shrink-0">
          <button onClick={onClose} aria-label="Back" className="p-1 text-white">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <p className="text-base text-white font-semibold flex-1">Posts</p>
        </div>

        {/* ===================== MOBILE LAYOUT ===================== */}
        <div className="md:hidden flex-1 min-h-0 overflow-y-auto flex flex-col">
          {/* Post author row */}
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <Avatar size="w-8 h-8" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-semibold truncate leading-tight">{username}</p>
              {post.music_url && (
                <p className="text-[11px] text-white/50 truncate leading-tight flex items-center gap-1">
                  <Music2 className="w-2.5 h-2.5" /> {post.music_title || "Original audio"}
                </p>
              )}
            </div>
            <button aria-label="More options" className="p-1 text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Media */}
          <div
            ref={mediaWrapRef}
            className="relative bg-black flex items-center justify-center flex-shrink-0 aspect-square w-full"
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

            {!isVideo && media.length > 1 && (
              <>
                {slide > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSlide((s) => s - 1); }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white text-black"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {slide < media.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSlide((s) => s + 1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white text-black"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px]">
                  {slide + 1}/{media.length}
                </span>
              </>
            )}

            {post.music_url && (
              <button
                onClick={(e) => { e.stopPropagation(); setAudioPlaying((v) => !v); }}
                className="absolute bottom-3 left-3 flex items-center gap-2 max-w-[70%] px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                aria-label={audioPlaying ? "Pause audio" : "Play audio"}
              >
                {audioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
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

          {/* Actions + meta */}
          <div className="px-3 pt-2.5">
            <ActionBar />
            {!isVideo && media.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 py-2">
                {media.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === slide ? "bg-sky-400" : "bg-white/25"}`} />
                ))}
              </div>
            )}
            <LikeMeta />
          </div>

          {/* Caption */}
          {post.description && (
            <p className="px-3 mt-2 text-sm text-white/90 leading-relaxed">
              <span className="font-semibold mr-2">{username}</span>
              {post.description}
            </p>
          )}

          {/* Comments */}
          <div className="px-3 mt-3 pb-24 space-y-4">
            {post.comments_enabled ? (
              comments.length === 0 ? (
                <p className="text-white/40 text-sm">No comments yet.</p>
              ) : (
                <>
                  <p className="text-white/40 text-sm">View all {comments.length} comments</p>
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-white/70 text-xs font-semibold">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 leading-relaxed">
                          <span className="font-semibold mr-2">{comment.author_name}</span>
                          {comment.content}
                        </p>
                        <p className="text-[11px] text-white/40 mt-1">{timeAgo(comment.created_at)} ago</p>
                        {comment.admin_reply && (
                          <div className="mt-2 ml-2 pl-3 border-l border-white/15">
                            <p className="text-sm text-white/80 leading-relaxed">
                              <span className="font-semibold mr-2">{username}</span>
                              {comment.admin_reply}
                            </p>
                            {comment.admin_reply_at && (
                              <p className="text-[11px] text-white/40 mt-1">{timeAgo(comment.admin_reply_at)} ago</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )
            ) : (
              <p className="text-white/40 text-xs">Comments are turned off for this post.</p>
            )}
          </div>

          {/* Comment input pinned to bottom */}
          {post.comments_enabled && (
            <form
              onSubmit={submitComment}
              className="sticky bottom-0 flex items-center gap-3 px-3 py-2.5 bg-black border-t border-white/10"
            >
              <Avatar size="w-8 h-8" />
              <input
                ref={commentInputRef}
                type="text"
                placeholder={`Add a comment for ${username}...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
              />
              {commentText.trim() ? (
                <button type="submit" className="text-sm font-semibold text-sky-400">
                  Post
                </button>
              ) : (
                <Smile className="w-5 h-5 text-white/40" />
              )}
              {/* hidden name field support: keep in state */}
              <input type="hidden" value={commentName} readOnly />
            </form>
          )}
        </div>

        {/* ===================== DESKTOP LAYOUT ===================== */}
        {/* Media left */}
        <div
          ref={undefined}
          className="hidden md:flex relative bg-black items-center justify-center flex-1 min-w-0 h-full border-r border-white/10"
        >
          {/* duplicate media wrapper ref handling: use a nested div with the ref for fullscreen */}
          <div ref={mediaWrapRef} className="absolute inset-0 flex items-center justify-center">
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
                  className="absolute bottom-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
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

            {!isVideo && media.length > 1 && (
              <>
                {slide > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSlide((s) => s - 1); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-white/80"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {slide < media.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSlide((s) => s + 1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-white/80"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {media.map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === slide ? "bg-white" : "bg-white/35"}`} />
                  ))}
                </div>
              </>
            )}

            {post.music_url && (
              <button
                onClick={(e) => { e.stopPropagation(); setAudioPlaying((v) => !v); }}
                className="absolute bottom-4 left-4 flex items-center gap-2 max-w-[70%] px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                aria-label={audioPlaying ? "Pause audio" : "Play audio"}
              >
                {audioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <Music2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs truncate">{post.music_title || "Original audio"}</span>
              </button>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sidebar right */}
        <aside className="hidden md:flex flex-col flex-none w-[380px] bg-black min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
            <Avatar size="w-8 h-8" />
            <p className="text-sm text-white font-semibold truncate flex-1">{username}</p>
            <button aria-label="More options" className="text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Caption + comments */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {post.description && (
              <div className="flex gap-3">
                <Avatar size="w-8 h-8" />
                <div>
                  <p className="text-sm text-white/90 leading-relaxed">
                    <span className="font-semibold mr-2">{username}</span>
                    {post.description}
                  </p>
                  {post.created_at && (
                    <p className="text-[11px] text-white/40 mt-1">{timeAgo(post.created_at)} ago</p>
                  )}
                </div>
              </div>
            )}

            {post.comments_enabled ? (
              comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-white/80 text-base font-bold">No comments yet.</p>
                  <p className="text-white/50 text-sm mt-1">Start the conversation.</p>
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
                      <p className="text-[11px] text-white/40 mt-1">{timeAgo(comment.created_at)} ago</p>
                      {comment.admin_reply && (
                        <div className="mt-2 flex gap-3">
                          <Avatar size="w-6 h-6" />
                          <div>
                            <p className="text-sm text-white/90 leading-relaxed">
                              <span className="font-semibold mr-2">{username}</span>
                              {comment.admin_reply}
                            </p>
                            {comment.admin_reply_at && (
                              <p className="text-[11px] text-white/40 mt-1">{timeAgo(comment.admin_reply_at)} ago</p>
                            )}
                          </div>
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

          {/* Actions */}
          <div className="border-t border-white/10 px-4 pt-3 pb-1 flex-shrink-0">
            <ActionBar />
            <LikeMeta />
          </div>

          {/* Comment form */}
          {post.comments_enabled && (
            <form onSubmit={submitComment} className="border-t border-white/10 px-4 py-3 flex-shrink-0">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder:text-white/30 outline-none mb-2"
              />
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-white/50 flex-shrink-0" />
                <input
                  ref={commentInputRef}
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
