import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera } from "lucide-react";

const Visual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="visual" className="py-24 lg:py-32 bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        <motion.div
          ref={ref}
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 block">visual.</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-6">
            Photography
          </h2>
          <p className="text-white/40 max-w-lg text-sm md:text-base leading-relaxed">
            Capturing moments through a lens. A visual diary of the world as I see it.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center justify-center py-20 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Camera className="w-12 h-12 text-white/20 mb-6" />
          <p className="text-white/30 text-sm tracking-wider uppercase">Coming Soon</p>
          <p className="text-white/20 text-xs mt-2">Photos will be showcased here</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Visual;
