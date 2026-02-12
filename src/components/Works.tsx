import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    number: "01",
    title: "The Rise",
    description: "About a band who wants to change the world through music",
    tags: ["React", "TypeScript", "Tailwind"],
    link: "https://enzotherise.netlify.app/",
  },
  {
    number: "02",
    title: "Calculator Relapse",
    description: "Can be use to prank your friends",
    tags: ["JavaScript", "Canvas", "HTML/CSS"],
    link: "https://calculcalcu.gt.tc/",
  },
  {
    number: "03",
    title: "Friendster Portfolio",
    description: "A replica of the classic Friendster Profile Page",
    tags: ["React", "Firebase", "HTML/CSS"],
    link: "https://enzooo.rf.gd/?i=1",
  },
];

const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.a
      ref={ref}
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-b border-white/10 py-10 md:py-14"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
        <div className="flex items-baseline gap-6 md:gap-10">
          <span className="text-sm text-white/30 tracking-wider font-mono">{project.number}</span>
          <div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white group-hover:text-white/70 transition-colors">
              {project.title}
            </h3>
            <p className="text-white/40 text-sm mt-2 max-w-md">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="text-xs text-white/30 tracking-wider uppercase">
                {tag}
              </span>
            ))}
          </div>
          <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
        </div>
      </div>
    </motion.a>
  );
};

const Works = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="works" className="py-24 lg:py-32 bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        <motion.div
          ref={headerRef}
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 block">works.</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight">
            Selected Projects
          </h2>
        </motion.div>

        <div className="border-t border-white/10">
          {projects.map((project, index) => (
            <ProjectCard key={project.number} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Works;
