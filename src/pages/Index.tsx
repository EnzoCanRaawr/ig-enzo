import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import ParallaxSection from "@/components/ParallaxSection";
import Works from "@/components/Works";
import About from "@/components/About";
import Visual from "@/components/Visual";
import Admin from "@/components/Admin";
import Footer from "@/components/Footer";
import bannerImage from "@/assets/banner.jpeg";
import { Github, Instagram, Facebook } from "lucide-react";

const navItems = [
  { label: "main.", href: "#" },
  { label: "works.", href: "#works" },
  { label: "about.", href: "#about" },
  { label: "visual.", href: "#visual" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/zoneclx", label: "GitHub" },
  { icon: Instagram, href: "https://instagram.com/enzogimena.shawn", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/enzodegimena.shawn", label: "Facebook" },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHash = () => setActiveSection(window.location.hash);
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const renderSection = () => {
    const section = (() => {
      switch (activeSection) {
        case "#works":
          return <Works />;
        case "#about":
          return <About />;
        case "#visual":
          return <Visual />;
        case "#admin":
          return <Admin />;
        default:
          return null;
      }
    })();

    if (activeSection === "#admin") return section;

    return section ? (
      <ParallaxSection scrollRef={scrollContainerRef as React.RefObject<HTMLElement>}>
        {section}
      </ParallaxSection>
    ) : null;
  };

  const isHome = !activeSection || activeSection === "#";

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: `url(${bannerImage})`,
          opacity: isHome ? 1 : 0.08,
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="flex items-center justify-between px-4 sm:px-8 md:px-12 py-4 sm:py-6">
          <ul className="flex items-center gap-3 sm:gap-6 md:gap-8">
            {navItems.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <a
                  href={item.href}
                  className={`text-xs sm:text-sm tracking-wide transition-colors ${
                    (item.href === "#" && isHome) || item.href === activeSection
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              </motion.li>
            ))}
          </ul>

          <div className="flex items-center gap-3 sm:gap-5">
            {socialLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-white/50 hover:text-white transition-colors"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isHome ? (
          <motion.div
            key="home"
            className="relative z-10 flex flex-col h-full px-4 sm:px-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            {/* Name positioned top-right */}
            <div className="flex flex-col items-end text-right mt-20 sm:mt-24 mr-2 sm:mr-4 md:mr-12">
              <h1 className="text-base sm:text-xl md:text-2xl font-display font-normal text-white tracking-[0.3em] sm:tracking-[0.45em] uppercase mb-2 sm:mb-3">
                Enzo Gimena
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-white/70 tracking-[0.15em] sm:tracking-[0.25em] uppercase italic">
                Student. Developer. Creating. Learning.
              </p>
            </div>

            {/* Discover button centered */}
            <div className="flex-1 flex items-center justify-center">
              <a
                href="#works"
                className="px-8 sm:px-10 py-2.5 sm:py-3 border border-white/50 text-white/90 text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                Discover
              </a>
            </div>

            <div className="pb-4 sm:pb-6 text-center">
              <p className="text-[10px] sm:text-xs text-white/40 tracking-wider">
                © {new Date().getFullYear()} Shawn Enzo J. Gimena. All Rights Reserved.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeSection}
            ref={scrollContainerRef}
            className="relative z-10 h-full overflow-y-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderSection()}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
