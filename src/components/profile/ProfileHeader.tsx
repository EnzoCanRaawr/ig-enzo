import { motion } from "framer-motion";
import { Github, Instagram, Facebook, Link as LinkIcon, Mail } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/zoneclx", label: "GitHub" },
  { icon: Instagram, href: "https://instagram.com/enzogimena.shawn", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/enzodegimena.shawn", label: "Facebook" },
];

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
  postCount,
  likeCount,
  commentCount,
}: {
  username: string;
  displayName: string;
  tagline: string;
  bio: string[];
  avatarUrl: string;
  email: string;
  websiteUrl?: string | null;
  postCount: number;
  likeCount: number;
  commentCount: number;
}) => {
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
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600">
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
        </div>

        <div className="flex-1 min-w-0">
          {/* Username row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-5">
            <h1 className="text-xl md:text-2xl text-white font-light tracking-wide">{username}</h1>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Message
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-7 mb-5">
            <Stat value={postCount} label="posts" />
            <Stat value={likeCount} label="likes" />
            <Stat value={commentCount} label="comments" />
          </div>

          {/* Bio */}
          <div className="text-center md:text-left space-y-1">
            <p className="text-sm text-white font-semibold">{displayName}</p>
            <p className="text-xs text-white/50 uppercase tracking-[0.2em]">{tagline}</p>
            {bio.slice(0, 2).map((line, i) => (
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
