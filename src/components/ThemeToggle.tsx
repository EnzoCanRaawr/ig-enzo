import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    // Add transitioning class for smooth animation
    document.documentElement.classList.add("transitioning");
    
    setTheme(theme === "dark" ? "light" : "dark");
    
    // Remove transitioning class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 400);
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-secondary/50 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={handleToggle}
      className="relative w-10 h-10 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 flex items-center justify-center overflow-hidden group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Background glow animation */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: isDark 
            ? "radial-gradient(circle, hsl(35 85% 55% / 0.15) 0%, transparent 70%)" 
            : "radial-gradient(circle, hsl(35 80% 50% / 0.15) 0%, transparent 70%)"
        }}
        transition={{ duration: 0.3 }}
      />

      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1],
              scale: { type: "spring", stiffness: 200, damping: 15 }
            }}
            className="relative z-10"
          >
            <Moon className="w-5 h-5 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1],
              scale: { type: "spring", stiffness: 200, damping: 15 }
            }}
            className="relative z-10"
          >
            <Sun className="w-5 h-5 text-primary" />
            {/* Sun rays animation */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-0.5 h-1 bg-primary/30 rounded-full"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-12px)`,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover ring effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/30"
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;
