import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Lightbulb, Rocket } from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Web Development",
    description:
      "Building modern, responsive websites and web applications using the latest technologies.",
    skills: ["React & TypeScript", "Tailwind CSS", "UI/UX Design"],
    accent: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Lightbulb,
    title: "Programming Projects",
    description:
      "Creating diverse programming solutions, from algorithms to full applications.",
    skills: ["Python & JavaScript", "Data Structures", "Problem Solving"],
    accent: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Rocket,
    title: "Learning & Growing",
    description:
      "Constantly expanding my knowledge in computer science and new technologies.",
    skills: ["CS Fundamentals", "Open Source", "Continuous Learning"],
    accent: "from-orange-500/20 to-yellow-500/20",
  },
];

const ServiceCard = ({ service, index }: { service: typeof services[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      
      <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 h-full hover:border-primary/30 transition-all duration-300">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          {service.title}
        </h3>

        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {service.description}
        </p>

        {/* Skills as tags */}
        <div className="flex flex-wrap gap-2">
          {service.skills.map((skill, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground border border-border/50"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Services = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="services" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            What I Do
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Services & Skills
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            As a passionate young developer, I'm dedicated to learning and building
            projects that solve real problems.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={isHeaderInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Interested in working together?</span>
            <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
