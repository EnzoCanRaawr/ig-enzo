import { motion, useInView } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";
import signature from "@/assets/signature.png";
import defaultProfilePhoto from "@/assets/enzo-profile.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Github, Instagram, Facebook } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/zoneclx", label: "GitHub" },
  { icon: Instagram, href: "https://instagram.com/enzogimena.shawn", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/enzodegimena.shawn", label: "Facebook" },
];

const defaultSkillCategories = [
  { title: "Languages", skills: ["JavaScript", "TypeScript", "Python", "HTML/CSS"] },
  { title: "Frameworks", skills: ["React", "Node.js", "Tailwind CSS", "Vite"] },
  { title: "Tools", skills: ["Git", "VS Code", "Chrome DevTools", "npm"] },
  { title: "Learning", skills: ["Algorithms", "Data Structures", "Web APIs", "Design Patterns"] },
];

const getAge = () => {
  const birth = new Date(2008, 8, 29);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

type AboutData = {
  bio_paragraphs: string[];
  skills: { title: string; skills: string[] }[];
  profile_image_url: string;
  email: string;
  tagline: string;
};

const defaultBio = [
  "Hey, I'm Enzo.",
  `I'm a ${getAge()}-year-old student developer passionate about building things on the web. I started coding a few years ago and haven't looked back since.`,
  "What drives me is the ability to turn ideas into reality through code. Whether it's building a website, solving algorithmic challenges, or learning a new framework, I'm always excited to dive into new projects.",
  "When I'm not coding, I enjoy learning about computer science fundamentals, contributing to open-source projects, and exploring new technologies that push the boundaries of what's possible.",
  "This website serves as my living portfolio. A place where my work in development, design, and photography can exist together.",
  "Thanks for being here.",
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const age = useMemo(() => getAge(), []);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    supabase
      .from("about_content")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAboutData(data as unknown as AboutData);
      });
  }, []);

  const bioParagraphs = aboutData?.bio_paragraphs?.length ? aboutData.bio_paragraphs : defaultBio;
  const skillCategories = aboutData?.skills?.length ? aboutData.skills : defaultSkillCategories;
  const profilePhoto = aboutData?.profile_image_url || defaultProfilePhoto;
  const contactEmail = aboutData?.email || "enzogimena.shawn@gmail.com";
  const tagline = aboutData?.tagline || "Developer. Student. Creator.";

  return (
    <section id="about" className="py-24 lg:py-32 bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center order-first"
          >
            <div className="w-full max-w-lg overflow-hidden border border-white/10 shadow-[0_8px_30px_-8px_rgba(255,255,255,0.08)]">
              <img src={profilePhoto} alt="Shawn Enzo J. Gimena" className="w-full h-auto object-cover grayscale pointer-events-none select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
            </div>
            <div className="text-center mt-6 space-y-1">
              <h2 className="text-lg md:text-xl font-display font-bold text-white tracking-wide">Shawn Enzo J. Gimena</h2>
              <p className="text-xs text-white/40 tracking-[0.2em] uppercase">{tagline}</p>
              <p className="text-xs text-white/30 mt-2">For collaborations, {contactEmail}</p>
              <div className="flex items-center justify-center gap-4 mt-4">
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
            </div>
          </motion.div>

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            {bioParagraphs.map((p, i) => (
              <p key={i} className="text-white/60 text-sm md:text-base leading-relaxed mb-6">{p}</p>
            ))}
            <div>
              <img src={signature} alt="Signature" className="h-20 md:h-24 w-auto opacity-60 grayscale pointer-events-none select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h3 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-8">skills.</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillCategories.map((category, i) => (
              <motion.div
                key={category.title}
                className="border-b border-white/10 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              >
                <h4 className="text-xs text-white/30 mb-4 uppercase tracking-[0.2em]">{category.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 border border-white/10 text-white/60 text-xs tracking-wide hover:border-white/30 hover:text-white/80 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
