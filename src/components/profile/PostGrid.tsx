import { motion } from "framer-motion";
import { Heart, MessageSquare, Play, Music2, Copy } from "lucide-react";
import { Post, postMedia, isVideoPost } from "./postTypes";

const PostTile = ({
  post,
  index,
  onOpen,
  likeCount,
  commentCount,
}: {
  post: Post;
  index: number;
  onOpen: () => void;
  likeCount: number;
  commentCount: number;
}) => {
  const media = postMedia(post);
  const isVideo = isVideoPost(post);
  const isCarousel = media.length > 1;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="relative aspect-square overflow-hidden bg-neutral-900 group"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.4) }}
    >
      {isVideo ? (
        <video
          src={media[0]}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={media[0]}
          alt={post.title || "Post"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      )}

      {/* Type badges */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {isCarousel && (
          <span className="p-1 rounded-sm bg-black/50 backdrop-blur-sm">
            <Copy className="w-3.5 h-3.5 text-white" />
          </span>
        )}
        {isVideo && (
          <span className="p-1 rounded-sm bg-black/50 backdrop-blur-sm">
            <Play className="w-3.5 h-3.5 text-white fill-current" />
          </span>
        )}
        {post.music_url && (
          <span className="p-1 rounded-sm bg-black/50 backdrop-blur-sm">
            <Music2 className="w-3.5 h-3.5 text-white" />
          </span>
        )}
      </div>

      {/* Audio ribbon */}
      {post.music_url && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
          <Music2 className="w-3 h-3 text-white/80 flex-shrink-0" />
          <span className="text-[10px] text-white/80 truncate">{post.music_title || "Original audio"}</span>
        </div>
      )}

      {/* Hover stats */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-300 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
        <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
          <Heart className="w-4 h-4 fill-current" /> {likeCount}
        </span>
        <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
          <MessageSquare className="w-4 h-4 fill-current" /> {commentCount}
        </span>
      </div>
    </motion.button>
  );
};

const PostGrid = ({
  posts,
  onOpen,
  likeCounts,
  commentCounts,
  emptyLabel,
}: {
  posts: Post[];
  onOpen: (index: number) => void;
  likeCounts: Record<string, number>;
  commentCounts: Record<string, number>;
  emptyLabel?: string;
}) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-white/10">
        <Music2 className="w-10 h-10 text-white/15 mb-5" />
        <p className="text-white/35 text-xs tracking-[0.3em] uppercase">{emptyLabel || "No posts yet"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post, i) => (
        <PostTile
          key={post.id}
          post={post}
          index={i}
          onOpen={() => onOpen(i)}
          likeCount={likeCounts[post.id] || 0}
          commentCount={commentCounts[post.id] || 0}
        />
      ))}
    </div>
  );
};

export default PostGrid;
