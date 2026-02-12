import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import signature from "@/assets/signature.png";
import profilePhoto from "@/assets/enzo-profile.jpg";

const skillCategories = [
  {
    title: "Languages",
    skills: ["JavaScript", "TypeScript", "Python", "HTML/CSS"],
  },
  {
    title: "Frameworks",
    skills: ["React", "Node.js", "Tailwind CSS", "Vite"],
  },
  {
    title: "Tools",
    skills: ["Git", "VS Code", "Chrome DevTools", "npm"],
  },
  {
    title: "Learning",
    skills: ["Algorithms", "Data Structures", "Web APIs", "Design Patterns"],
  },
];

const getAge = () => {
  const birth = new Date(2008, 8, 29); // September 29, 2008
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const age = useMemo(() => getAge(), []);

  return (
    <section id="about" className="py-24 lg:py-32 bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        {/* Hero: Text left, Photo right - like reference */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 mb-24">
          {/* Left side - bio text */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6">
              Hey, I'm Enzo.
            </p>
            <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6">
              I'm a {age}-year-old student developer passionate about building things on the web. I started coding a few years ago and haven't looked back since.
            </p>
            <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6">
              What drives me is the ability to turn ideas into reality through code. Whether it's building a website, solving algorithmic challenges, or learning a new framework, I'm always excited to dive into new projects.
            </p>
            <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6">
              When I'm not coding, I enjoy learning about computer science fundamentals, contributing to open-source projects, and exploring new technologies that push the boundaries of what's possible.
            </p>
            <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6">
              This website serves as my living portfolio. A place where my work in development, design, and photography can exist together.
            </p>
            <p className="text-white/60 text-sm md:text-base leading-relaxed mb-10">
              Thanks for being here.
            </p>

            {/* Signature */}
            <div>
              <img
                src={signature}
                alt="Shawn Enzo J. Gimena signature"
                className="h-20 md:h-24 w-auto opacity-60 grayscale"
              />
            </div>
          </motion.div>

          {/* Right side - photo + caption */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-full max-w-md overflow-hidden">
              <img
                src={profilePhoto}
                alt="Shawn Enzo J. Gimena"
                className="w-full h-auto object-cover grayscale"
              />
            </div>
            <div className="text-center mt-6 space-y-1">
              <h2 className="text-lg md:text-xl font-display font-bold text-white tracking-wide">
                Shawn Enzo J. Gimena
              </h2>
              <p className="text-xs text-white/40 tracking-[0.2em] uppercase">
                Developer. Student. Creator.
              </p>
              <p className="text-xs text-white/30 mt-2">
                For collaborations, enzogimena.shawn@gmail.com
              </p>
            </div>
          </motion.div>
        </div>

        {/* Skills section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h3 className="text-xs uppercase tracking-[0.3em] text-white/30 mb-8">
            skills.
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillCategories.map((category, i) => (
              <motion.div
                key={category.title}
                className="border-b border-white/10 pb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              >
                <h4 className="text-xs text-white/30 mb-4 uppercase tracking-[0.2em]">
                  {category.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 border border-white/10 text-white/60 text-xs tracking-wide hover:border-white/30 hover:text-white/80 transition-colors cursor-default"
                    >
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
