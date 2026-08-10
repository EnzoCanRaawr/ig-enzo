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

  const [intro, ...restBio] = bioParagraphs;

  return (
    <section id="about" className="bg-paper text-ink font-epilogue py-28 lg:py-40">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        {/* Masthead */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-rule/15 pb-10 mb-16 lg:mb-24"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-ink-muted">about</span>
          <h2 className="font-editorial font-light text-ink text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.92] tracking-tight mt-6">
            {intro?.replace(/[.!]$/, "") || "Hey, I'm Enzo"}
          </h2>
        </motion.div>

        {/* Asymmetric 60 / 40 */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-14 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {restBio.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-ink-soft text-lg md:text-2xl font-light leading-[1.55] mb-10 first-letter:font-editorial first-letter:text-5xl first-letter:md:text-6xl first-letter:leading-[0.8] first-letter:float-left first-letter:mr-3 first-letter:mt-1"
                    : "text-ink-muted text-[0.95rem] md:text-base font-light leading-[1.85] mb-6 max-w-[62ch]"
                }
              >
                {p}
              </p>
            ))}
            <img
              src={signature}
              alt="Signature of Shawn Enzo J. Gimena"
              className="h-20 md:h-24 w-auto mt-4 opacity-80 mix-blend-multiply dark:mix-blend-screen pointer-events-none select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-24"
          >
            <div className="overflow-hidden bg-paper-alt">
              <img
                src={profilePhoto}
                alt="Shawn Enzo J. Gimena"
                className="w-full aspect-[4/5] object-cover grayscale contrast-[1.05] pointer-events-none select-none transition-transform duration-[1200ms] ease-out hover:scale-[1.03]"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            <div className="mt-7 border-t border-rule/15 pt-6">
              <h3 className="font-editorial text-base md:text-lg text-ink tracking-[0.45em] font-normal uppercase leading-relaxed">
                Shawn Enzo J. Gimena
              </h3>
              <p className="text-[10px] text-ink-muted tracking-[0.35em] uppercase mt-3">{tagline}</p>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-5 inline-block text-xs text-ink-soft border-b border-rule/25 pb-0.5 hover:border-rule/70 transition-colors"
              >
                {contactEmail}
              </a>
              <div className="flex items-center gap-6 mt-7">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted hover:text-ink transition-colors duration-300"
                    aria-label={link.label}
                  >
                    <link.icon className="w-4 h-4" strokeWidth={1.25} />
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Skills index */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="mt-28 lg:mt-40 border-t border-rule/15 pt-12"
        >
          <h3 className="text-[10px] uppercase tracking-[0.5em] text-ink-muted mb-12">skills</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12">
            {skillCategories.map((category, i) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.42 + i * 0.08 }}
              >
                <div className="flex items-baseline gap-3 border-b border-rule/15 pb-3 mb-5">
                  <span className="font-editorial text-xs text-ink-muted">0{i + 1}</span>
                  <h4 className="font-editorial text-[11px] text-ink uppercase tracking-[0.3em]">{category.title}</h4>
                </div>
                <ul className="space-y-2.5">
                  {category.skills.map((skill) => (
                    <li key={skill} className="text-sm font-light text-ink-muted hover:text-ink transition-colors">
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};


export default About;
