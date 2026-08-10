export type Post = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  media_urls: string[] | null;
  media_type: string;
  post_kind: string;
  music_url: string | null;
  music_title: string | null;
  music_platform: string | null;
  display_order: number;
  is_enabled: boolean;
  comments_enabled: boolean;
  created_at?: string;
};

export type PostComment = {
  id: string;
  photo_id: string;
  author_name: string;
  content: string;
  created_at: string;
  admin_reply: string | null;
  admin_reply_at: string | null;
};

export const postMedia = (post: Post): string[] => {
  const list = (post.media_urls || []).filter(Boolean);
  return list.length > 0 ? list : [post.image_url];
};

export const isVideoPost = (post: Post) => post.media_type === "video" || post.post_kind === "reel";

export const getSessionId = () => {
  let id = localStorage.getItem("visitor_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_session_id", id);
  }
  return id;
};

export const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};
