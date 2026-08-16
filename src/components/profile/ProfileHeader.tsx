import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Instagram, Facebook, Link as LinkIcon, Mail, UserPlus, Check } from "lucide-react";

const VerifiedBadge = () => (
  <span
    className="inline-flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full bg-sky-500 text-white"
    aria-label="Verified account"
    title="Verified"
  >
    <Check className="w-2.5 h-2.5 md:w-3 md:h-3 stroke-[3.5]" />
  </span>
);

const Stat = ({ value, label }: { value: number | string; label: string }) => (
  <div className="text-center md:text-left">
    <span className="text-white font-semibold text-base md:text-lg">{value}</span>
    <span className="text-white/50 text-xs md:text-sm ml-1.5">{label}</span>
  </div>
);

const ProfileHeader = ({
  username,
  displayName,
  tagline,
  bio,
  avatarUrl,
  email,
  websiteUrl,
  githubUrl,
  instagramUrl,
  facebookUrl,
  postCount,
  likeCount,
  commentCount,
  avatarSlot,
}: {
  username: string;
  displayName: string;
  tagline: string;
  bio: string[];
  avatarUrl: string;
  email: string;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  postCount: number;
  likeCount: number;
  commentCount: number;
  avatarSlot?: ReactNode;
}) => {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(localStorage.getItem("profile-following") === "true");
  }, []);

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    localStorage.setItem("profile-following", String(next));
  };

  const socialLinks = [
    { icon: Github, href: githubUrl, label: "GitHub" },
    { icon: Instagram, href: instagramUrl, label: "Instagram" },
    { icon: Facebook, href: facebookUrl, label: "Facebook" },
  ].filter((l) => !!l.href) as { icon: typeof Github; href: string; label: string }[];

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="pt-24 pb-10 md:pb-14"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-14">
        {/* Avatar with story ring */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          {avatarSlot ?? (
            <div className="p-[3px] rounded-full bg-white/15">
              <div className="p-[3px] rounded-full bg-black">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover select-none pointer-events-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Username row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-5">
            <h1 className="text-xl md:text-2xl text-white font-light tracking-wide">{username}</h1>
            <button
              type="button"
              onClick={toggleFollow}
              aria-pressed={following}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                following
                  ? "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                  : "bg-sky-500 hover:bg-sky-400 text-white"
              }`}
            >
              {following ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {following ? "Following" : "Follow"}
            </button>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Message
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-7 mb-5">
            <Stat value={postCount} label="posts" />
            <Stat value="1.4K" label="followers" />
            <Stat value={likeCount} label="likes" />
            <Stat value={commentCount} label="comments" />

          </div>

          {/* Bio */}
          <div className="text-center md:text-left space-y-1">
            <p className="text-sm text-white font-semibold">{displayName}</p>
            <p className="text-xs text-white/50 uppercase tracking-[0.2em]">{tagline}</p>
            {bio.map((line, i) => (
              <p key={i} className="text-sm text-white/70 leading-relaxed max-w-xl">{line}</p>
            ))}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          {/* Socials */}
          <div className="flex items-center justify-center md:justify-start gap-5 mt-5">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ProfileHeader;
