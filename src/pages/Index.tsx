import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Grid3X3, Clapperboard, Briefcase, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import defaultAvatar from "@/assets/enzo-profile.jpg";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostGrid from "@/components/profile/PostGrid";
import PostLightbox from "@/components/profile/PostLightbox";
import StoryBar from "@/components/profile/StoryBar";
import { Post, isVideoPost } from "@/components/profile/postTypes";
import Works from "@/components/Works";
import About from "@/components/About";
import Admin from "@/components/Admin";

type ProfileData = {
  bio_paragraphs: string[];
  profile_image_url: string;
  email: string;
  tagline: string;
  username: string;
  display_name: string;
  website_url: string | null;
};

const tabs = [
  { id: "posts", label: "Posts", icon: Grid3X3 },
  { id: "reels", label: "Reels", icon: Clapperboard },
  { id: "works", label: "Works", icon: Briefcase },
  { id: "about", label: "About", icon: UserRound },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Index = () => {
  const [hash, setHash] = useState("");
  const [tab, setTab] = useState<TabId>("posts");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleHash = () => setHash(window.location.hash);
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

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
    supabase.from("about_content").select("*").limit(1).single().then(({ data }) => {
      if (data) setProfile(data as unknown as ProfileData);
    });
    supabase
      .from("visual_photos")
      .select("*")
      .eq("is_enabled", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setPosts(data as unknown as Post[]);
        setLoading(false);
      });
    fetchCounts();
  }, [fetchCounts]);

  const totals = useMemo(() => ({
    likes: Object.values(likeCounts).reduce((a, b) => a + b, 0),
    comments: Object.values(commentCounts).reduce((a, b) => a + b, 0),
  }), [likeCounts, commentCounts]);

  const reels = useMemo(() => posts.filter(isVideoPost), [posts]);
  const visiblePosts = tab === "reels" ? reels : posts;

  const openPost = (index: number) => setActiveIndex(index);
  const closePost = () => setActiveIndex(null);
  const nextPost = () =>
    setActiveIndex((p) => (p === null ? null : p === visiblePosts.length - 1 ? 0 : p + 1));
  const prevPost = () =>
    setActiveIndex((p) => (p === null ? null : p === 0 ? visiblePosts.length - 1 : p - 1));

  if (hash === "#admin") return <Admin />;

  const username = profile?.username || "enzo";
  const displayName = profile?.display_name || "Shawn Enzo J. Gimena";
  const avatarUrl = profile?.profile_image_url || defaultAvatar;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <ProfileHeader
          username={username}
          displayName={displayName}
          tagline={profile?.tagline || "Developer. Student. Creator."}
          bio={profile?.bio_paragraphs?.length ? profile.bio_paragraphs : ["Student developer building things on the web."]}
          avatarUrl={avatarUrl}
          email={profile?.email || "enzogimena.shawn@gmail.com"}
          websiteUrl={profile?.website_url}
          postCount={posts.length}
          likeCount={totals.likes}
          commentCount={totals.comments}
        />

        <StoryBar username={username} avatarUrl={avatarUrl} />



        {/* Tabs */}
        <nav className="border-t border-white/10 flex items-center justify-center gap-8 sm:gap-14">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setActiveIndex(null); }}
              className={`relative -mt-px flex items-center gap-2 py-4 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                tab === t.id ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span
                className={`absolute top-0 left-0 right-0 h-px transition-colors ${tab === t.id ? "bg-white" : "bg-transparent"}`}
              />
              <t.icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="pt-6"
          >
            {tab === "posts" || tab === "reels" ? (
              loading ? (
                <div className="py-24 text-center text-white/30 text-sm">Loading...</div>
              ) : (
                <PostGrid
                  posts={visiblePosts}
                  onOpen={openPost}
                  likeCounts={likeCounts}
                  commentCounts={commentCounts}
                  emptyLabel={tab === "reels" ? "No reels yet" : "No posts yet"}
                />
              )
            ) : tab === "works" ? (
              <div className="-mx-4 sm:-mx-6">
                <Works />
              </div>
            ) : (
              <div className="-mx-4 sm:-mx-6">
                <About />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeIndex !== null && visiblePosts[activeIndex] && (
          <PostLightbox
            posts={visiblePosts}
            activeIndex={activeIndex}
            username={username}
            avatarUrl={avatarUrl}
            onClose={closePost}
            onNext={nextPost}
            onPrev={prevPost}
            onCountsChange={fetchCounts}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
