import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type VisualPhoto = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
};

const Visual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [photos, setPhotos] = useState<VisualPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("visual_photos")
      .select("*")
      .order("display_order")
      .then(({ data }) => {
        if (data) setPhotos(data as unknown as VisualPhoto[]);
        setLoading(false);
      });
  }, []);

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

        {loading ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">Loading...</p>
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                className="overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {photo.title && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs tracking-wider">{photo.title}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
};

export default Visual;
