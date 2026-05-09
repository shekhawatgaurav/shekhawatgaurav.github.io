import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Archive", href: "/archive" },
  { label: "Contact", href: "#contact" },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showMobileTip, setShowMobileTip] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
    const dismissed = sessionStorage.getItem("desktop-tip-dismissed");

    if (isSmallScreen && !dismissed) {
      setShowMobileTip(true);
    }
  }, []);

  const dismissMobileTip = () => {
    sessionStorage.setItem("desktop-tip-dismissed", "true");
    setShowMobileTip(false);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 bg-cream/80 text-ink backdrop-blur-xl border-b border-border/60"
            : "py-4 sm:py-6 text-ink"
        }`}
      >
        <div className="container flex items-center justify-between">
          <a href="#" className="group flex items-center" aria-label="Gaurav Shekhawat home">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Gaurav Shekhawat"
              className="h-12 w-auto max-w-[145px] object-contain transition-all duration-300 group-hover:scale-[1.03] sm:h-24 sm:max-w-[310px]"
            />
          </a>

          <nav
            className={`hidden md:flex items-center gap-1 rounded-full border px-2 py-1.5 shadow-card backdrop-blur ${
              scrolled ? "border-border/60 bg-card/60" : "border-border/60 bg-card/60"
            }`}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-1.5 text-sm rounded-full transition-colors duration-300 hover:bg-ink hover:text-cream"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors duration-300 hover:bg-terracotta group"
            >
              Let's talk
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-cream border-t border-border mt-3"
            >
              <div className="container py-4 flex flex-col gap-2">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="py-2 text-lg font-display"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed right-4 top-5 z-[80] flex h-10 w-10 items-center justify-center rounded-full bg-ink text-cream shadow-card md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {showMobileTip && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-4 bottom-4 z-[60] rounded-2xl border border-border bg-cream p-4 shadow-card sm:hidden"
            role="dialog"
            aria-label="Desktop recommended"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-terracotta">
                  Desktop recommended
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This portfolio is responsive, but project previews look best on laptop or desktop.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissMobileTip}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-cream"
                aria-label="Close desktop recommendation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
