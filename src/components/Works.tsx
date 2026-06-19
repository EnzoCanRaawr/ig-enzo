import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { ExternalLink, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type WorksProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  display_order: number;
  image_url: string | null;
  category: string;
};

const ProjectCard = ({ project, index }: { project: WorksProject; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.a
      ref={ref}
      href={project.link || undefined}
      target={project.link ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group block border-b border-white/10 py-10 md:py-14"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
        <div className="flex items-start gap-6 md:gap-10 flex-1 min-w-0">
          <span className="text-sm text-white/30 tracking-wider font-mono mt-1 md:mt-2 flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.image_url && (
            <img
              src={project.image_url}
              alt={project.title}
              className="w-16 h-16 md:w-20 md:h-20 object-cover flex-shrink-0 border border-white/10 group-hover:border-white/20 transition-colors"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border border-white/20 text-white/60">
                {project.category || "project"}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white group-hover:text-white/70 transition-colors">
              {project.title}
            </h3>
            <p className="text-white/40 text-sm mt-2 max-w-md">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-2">
            {project.tags?.map((tag) => (
              <span key={tag} className="text-xs text-white/30 tracking-wider uppercase">
                {tag}
              </span>
            ))}
          </div>
          {project.link && (
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
          )}
        </div>
      </div>
    </motion.a>
  );
};

const Works = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  const [projects, setProjects] = useState<WorksProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("works_projects")
      .select("*")
      .order("display_order")
      .then(({ data }) => {
        if (data) setProjects(data as unknown as WorksProject[]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.category || "project"));
    return ["all", ...Array.from(set)];
  }, [projects]);

  const filtered = activeCategory === "all"
    ? projects
    : projects.filter((p) => (p.category || "project") === activeCategory);

  return (
    <section id="works" className="py-24 lg:py-32 bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        <motion.div
          ref={headerRef}
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 block">works.</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight">
            Selected Projects
          </h2>
        </motion.div>

        {categories.length > 2 && (
          <div className="flex gap-2 mb-10 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`text-[10px] uppercase tracking-[0.2em] px-3 py-2 border transition-colors ${
                  activeCategory === c
                    ? "border-white text-white bg-white/10"
                    : "border-white/20 text-white/50 hover:text-white hover:border-white/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">Loading...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="border-t border-white/10">
            {filtered.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-white/10">
            <Briefcase className="w-10 h-10 text-white/20 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No projects in this category yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Works;
