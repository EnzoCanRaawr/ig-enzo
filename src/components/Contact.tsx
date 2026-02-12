import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Github, Instagram, Facebook } from "lucide-react";

const socialLinks = [
  {
    icon: Mail,
    label: "Email",
    href: "mailto:enzogimena.shawn@gmail.com",
    username: "enzogimena.shawn@gmail.com",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/zoneclx",
    username: "@zoneclx",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/enzogimena.shawn",
    username: "@enzogimena.shawn",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "https://facebook.com/enzodegimena.shawn",
    username: "enzodegimena.shawn",
  },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-24 lg:py-32 bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 md:px-12">
        <motion.div
          ref={ref}
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/30 mb-4 block">contact.</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight mb-6">
            Let's Connect
          </h2>
          <p className="text-white/40 max-w-lg text-sm md:text-base leading-relaxed">
            I'm always open to collaborating on interesting projects, learning
            opportunities, or just having a chat about technology.
          </p>
        </motion.div>

        <div className="border-t border-white/10">
          {socialLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-8 border-b border-white/10 hover:px-4 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center gap-6">
                <link.icon className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                <span className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-white/70 transition-colors">
                  {link.label}
                </span>
              </div>
              <span className="text-sm text-white/30 group-hover:text-white/50 transition-colors hidden sm:block">
                {link.username}
              </span>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Contact;
