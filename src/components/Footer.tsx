import { Github, Instagram, Facebook } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/zoneclx", label: "GitHub" },
  { icon: Instagram, href: "https://instagram.com/enzogimena.shawn", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/enzodegimena.shawn", label: "Facebook" },
];

const Footer = () => {
  return (
    <footer className="relative bg-neutral-950 text-white/40 overflow-hidden">
      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm font-display text-white/60 tracking-[0.2em] uppercase mb-1">
              Enzo Gimena
            </p>
            <p className="text-[10px] sm:text-xs text-white/25 tracking-wider">
              Student · Developer · Creator
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/30 hover:text-white/70 hover:border-white/30 transition-all duration-300"
                aria-label={link.label}
              >
                <link.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>

          {/* Back to top */}
          <a
            href="#"
            className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-white/25 hover:text-white/60 transition-colors duration-300 flex items-center gap-1.5"
          >
            Back to top <span className="text-sm">↑</span>
          </a>
        </div>

        {/* Bottom line */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] sm:text-xs text-white/20 tracking-wider">
            © {new Date().getFullYear()} Shawn Enzo J. Gimena. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
