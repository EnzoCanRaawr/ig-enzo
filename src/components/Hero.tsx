import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, ContactShadows, Environment } from "@react-three/drei";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";

function PorscheModel({ isDarkMode, isMobile }: { isDarkMode: boolean; isMobile: boolean }) {
  const lightModel = useGLTF("/models/2020_Porsche_911_RSR.glb");
  const darkModel = useGLTF("/models/2019_Porsche_911_GT2_RS_Clubsport.glb");
  
  const scene = isDarkMode ? darkModel.scene : lightModel.scene;
  // Responsive scale with slight zoom - larger on all devices
  const scale = isMobile ? 0.85 : 1.15;
  
  return <primitive object={scene} scale={scale} position={[0, -0.5, 0]} rotation={[0, Math.PI * 0.15, 0]} />;
}

function ModelTransitionWrapper({ isDarkMode, isMobile }: { isDarkMode: boolean; isMobile: boolean }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMode, setCurrentMode] = useState(isDarkMode);

  useEffect(() => {
    if (isDarkMode !== currentMode) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentMode(isDarkMode);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isDarkMode, currentMode]);

  return (
    <group>
      <PorscheModel isDarkMode={currentMode} isMobile={isMobile} />
    </group>
  );
}

const Hero = () => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isDarkMode = theme === "dark";

  return (
    <section className="min-h-screen relative overflow-hidden pt-24 lg:pt-28">
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="container mx-auto px-6 py-12 md:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center min-h-[80vh]">
          {/* Left content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">Student Developer</span>
            </motion.div>

            <motion.h1
              className="text-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] text-foreground"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              SHAWN
              <br />
              <span className="text-muted-foreground/40">ENZO J.</span>
              <br />
              GIMENA
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowDown className="w-4 h-4 animate-bounce" />
              <span className="text-sm">Scroll to explore</span>
            </motion.div>

            <motion.p
              className="text-lg text-muted-foreground max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              A 16-year-old student passionate about programming and building
              innovative digital solutions. Always learning, always creating.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-all hover:gap-3"
              >
                Contact
                <span>↗</span>
              </a>
              <a
                href="#works"
                className="inline-flex items-center gap-2 px-6 py-3 border border-foreground/20 text-foreground rounded-full font-medium hover:border-foreground/40 transition-colors"
              >
                View Projects
              </a>
            </motion.div>
          </div>

          {/* Right content - 3D Model */}
          <motion.div
            className="relative lg:justify-self-end w-full h-[350px] sm:h-[450px] lg:h-[500px]"
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Background Porsche text */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <span 
                className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] text-foreground/[0.04] dark:text-foreground/[0.08]"
                style={{ 
                  fontFamily: "'911 Porscha', sans-serif",
                  letterSpacing: "0.05em"
                }}
              >
                PORSCHE
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={isDarkMode ? "dark" : "light"}
                className="relative w-full h-full rounded-3xl overflow-hidden z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Canvas
                  camera={{ position: isMobile ? [6, 1.5, 4] : [7, 1.2, 3], fov: isMobile ? 35 : 30 }}
                  className="w-full h-full"
                >
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
                  <Suspense fallback={null}>
                    <PorscheModel isDarkMode={isDarkMode} isMobile={isMobile} />
                    <Environment files="/hdri/studio.hdr" />
                    <ContactShadows
                      position={[0, -0.5, 0]}
                      opacity={0.5}
                      scale={10}
                      blur={2}
                    />
                  </Suspense>
                  <OrbitControls
                    enablePan={false}
                    minDistance={3}
                    maxDistance={10}
                  />
                </Canvas>
              </motion.div>
            </AnimatePresence>

            {/* Floating card */}
            <motion.div
              className="absolute bottom-4 right-4 glass-card px-6 py-4 rounded-2xl z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Available for Projects
              </p>
              <p className="text-2xl font-display font-bold text-foreground">
                {new Date().getFullYear()}
              </p>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -top-6 -left-6 w-full h-full border-2 border-primary/20 rounded-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

useGLTF.preload("/models/2020_Porsche_911_RSR.glb");
useGLTF.preload("/models/2019_Porsche_911_GT2_RS_Clubsport.glb");

export default Hero;
