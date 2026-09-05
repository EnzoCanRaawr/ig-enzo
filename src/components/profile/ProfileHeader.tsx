import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Github, Instagram, Facebook, Link as LinkIcon, Mail, UserPlus, Check,
  Volume2, VolumeX, Music2,
} from "lucide-react";
import { getMusicEmbed } from "@/lib/music";

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
  musicUrl,
  musicTitle,
  bannerUrl,
  bannerType,
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
  musicUrl?: string | null;
  musicTitle?: string | null;
  bannerUrl?: string | null;
  bannerType?: string | null;
}) => {

  const [following, setFollowing] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const profileEmbed = getMusicEmbed(musicUrl || null);
  const hasSound = !!profileEmbed?.embedUrl;

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

  const soundButton = hasSound ? (
    <button
      type="button"
      onClick={() => setSoundOn((v) => !v)}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Turn profile sound off" : "Turn profile sound on"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
        soundOn
          ? "bg-white text-black"
          : "bg-white/10 hover:bg-white/15 border border-white/15 text-white"
      }`}
    >
      {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      <Music2 className="w-3 h-3" />
      <span className="max-w-[120px] truncate">{musicTitle || "Profile audio"}</span>
    </button>
  ) : null;

  const hasBanner = !!bannerUrl;
  const isBannerVideo = bannerType === "video";

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative pb-8 md:pb-14 ${
        hasBanner ? "pt-[110px] sm:pt-[150px] md:pt-[220px]" : "pt-6 md:pt-24"
      }`}
    >
      {/* Full-bleed banner behind the profile */}
      {hasBanner && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen max-w-[100vw] h-[190px] sm:h-[250px] md:h-[340px] overflow-hidden -z-10 pointer-events-none select-none"
          aria-hidden="true"
        >
          {isBannerVideo ? (
            <video
              src={bannerUrl!}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={bannerUrl!} alt="" className="w-full h-full object-cover" draggable={false} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />
        </div>
      )}

      {/* Hidden profile audio player */}
      {hasSound && soundOn && (
        <iframe
          src={profileEmbed!.embedUrl!}
          title="Profile audio"
          className="absolute w-px h-px opacity-0 pointer-events-none -z-10"
          allow="autoplay; encrypted-media"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      <div className="relative flex flex-row items-center md:items-start gap-4 sm:gap-5 md:gap-14">
        {/* Avatar with story ring */}

        <div className="flex-shrink-0">
          {avatarSlot ?? (
            <div className="p-[3px] rounded-full bg-white/15">
              <div className="p-[3px] rounded-full bg-black">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-[86px] h-[86px] md:w-36 md:h-36 rounded-full object-cover select-none pointer-events-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Username row */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-3 md:mb-5">
            <h1 className="text-lg md:text-2xl text-white font-light tracking-wide flex items-center gap-2">
              {username}
              <VerifiedBadge />
            </h1>
            <div className="hidden md:flex items-center gap-3">
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
              {soundButton}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 md:gap-7">
            <Stat value={postCount} label="posts" />
            <Stat value="1.4K" label="followers" />
            <Stat value={likeCount} label="likes" />
            <Stat value={commentCount} label="comments" />
          </div>
        </div>
      </div>

      {/* Bio — full width below, like Instagram */}
      <div className="mt-4 md:mt-6 space-y-1">
        <p className="text-sm text-white font-semibold">{displayName}</p>
        <p className="text-xs text-white/50 uppercase tracking-[0.2em]">{tagline}</p>
        {bio.map((line, i) => (
          <p key={i} className="text-sm text-white/80 leading-relaxed max-w-xl">{line}</p>
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

        {/* Mobile: full-width Instagram-style actions */}
        <div className="md:hidden pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFollow}
              aria-pressed={following}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                following
                  ? "bg-white/10 text-white border border-white/15"
                  : "bg-sky-500 text-white"
              }`}
            >
              {following ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {following ? "Following" : "Follow"}
            </button>
            <a
              href={`mailto:${email}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm font-semibold"
            >
              <Mail className="w-4 h-4" /> Message
            </a>
          </div>
          {soundButton}
        </div>

        {/* Socials */}
        <div className="flex items-center gap-5 pt-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label={link.label}
            >
              <link.icon className="w-5 h-5 md:w-4 md:h-4" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </div>
    </motion.header>
  );
};

export default ProfileHeader;
