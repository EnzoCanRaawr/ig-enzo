export type MusicPlatform = "youtube" | "spotify" | "soundcloud" | "other";

export type MusicEmbed = {
  platform: MusicPlatform;
  embedUrl: string | null;
  height: number;
};

const YT_PATTERNS = [
  /youtu\.be\/([\w-]{6,})/i,
  /youtube\.com\/watch\?v=([\w-]{6,})/i,
  /youtube\.com\/shorts\/([\w-]{6,})/i,
  /youtube\.com\/embed\/([\w-]{6,})/i,
];

export const detectPlatform = (url: string): MusicPlatform => {
  if (/youtu\.be|youtube\.com/i.test(url)) return "youtube";
  if (/spotify\.com/i.test(url)) return "spotify";
  if (/soundcloud\.com/i.test(url)) return "soundcloud";
  return "other";
};

export const getMusicEmbed = (url: string | null | undefined): MusicEmbed | null => {
  if (!url) return null;
  const platform = detectPlatform(url);

  if (platform === "youtube") {
    for (const p of YT_PATTERNS) {
      const m = url.match(p);
      if (m) {
        return {
          platform,
          embedUrl: `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`,
          height: 200,
        };
      }
    }
    return { platform, embedUrl: null, height: 200 };
  }

  if (platform === "spotify") {
    const m = url.match(/spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([\w-]+)/i);
    if (m) {
      return {
        platform,
        embedUrl: `https://open.spotify.com/embed/${m[1].toLowerCase()}/${m[2]}?utm_source=generator`,
        height: 152,
      };
    }
    return { platform, embedUrl: null, height: 152 };
  }

  if (platform === "soundcloud") {
    return {
      platform,
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ffffff&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false`,
      height: 166,
    };
  }

  return { platform: "other", embedUrl: null, height: 0 };
};

export const platformLabel = (platform: MusicPlatform) =>
  platform === "youtube" ? "YouTube" : platform === "spotify" ? "Spotify" : platform === "soundcloud" ? "SoundCloud" : "Audio";
