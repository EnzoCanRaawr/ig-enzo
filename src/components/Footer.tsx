const Footer = () => {
  return (
    <footer className="py-6 bg-neutral-950 text-white/30 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-8 md:px-12 flex items-center justify-between">
        <p className="text-xs tracking-wider">
          © {new Date().getFullYear()} Shawn Enzo J. Gimena
        </p>
        <a
          href="#"
          className="text-xs tracking-wider hover:text-white/60 transition-colors"
        >
          ↑
        </a>
      </div>
    </footer>
  );
};

export default Footer;
