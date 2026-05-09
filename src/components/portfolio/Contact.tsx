import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart } from "lucide-react";
import { useEffect, useRef } from "react";

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const footerLineRef = useRef<HTMLParagraphElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const emailButton = emailRef.current;

    if (reduceMotion) {
      gsap.set([emailButton, footerLineRef.current], { opacity: 1, x: 0, y: 0, scale: 1 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.set(gradientRef.current, {
        backgroundPosition: "0% 50%",
        backgroundSize: "180% 180%",
        scale: 1.08,
        transformOrigin: "center",
      });

      gsap.to(gradientRef.current, {
        backgroundPosition: "100% 50%",
        xPercent: 3,
        yPercent: -2,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        emailButton,
        { opacity: 0, scale: 0.92, y: 18 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: emailButton,
            start: "top 88%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        footerLineRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );

      const heartPulse = gsap.to(heartRef.current, {
        scale: 1.25,
        rotate: -8,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "center",
        paused: true,
      });

      ScrollTrigger.create({
        trigger: footerRef.current,
        start: "top 92%",
        onEnter: () => heartPulse.play(),
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="pt-32 pb-12 relative overflow-hidden">
      <div
        ref={gradientRef}
        className="pointer-events-none absolute -inset-12 bg-gradient-aurora opacity-10 will-change-transform"
      />
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-8"
          >
            Say hello
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-6xl md:text-9xl leading-[0.9] tracking-tight text-balance"
          >
            Let's make
            <br />
            something
            <br />
            <em className="italic font-light text-terracotta">unforgettable.</em>
          </motion.h2>

          <a
            ref={emailRef}
            href="mailto:shekhawatgauravv@gmail.com"
            className="group inline-flex mt-12 items-center gap-3 rounded-full bg-ink px-8 py-5 text-lg font-medium text-cream opacity-0 shadow-soft transition-colors duration-300 hover:bg-terracotta"
          >
            shekhawatgauravv@gmail.com
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink transition-transform duration-300 group-hover:translate-x-0.5">
              -&gt;
            </span>
          </a>

          <div className="mt-20 grid sm:grid-cols-3 gap-8 text-left max-w-2xl mx-auto">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Based in</p>
              <p className="font-display text-xl">Jaipur, India</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Time zone</p>
              <p className="font-display text-xl">IST - UTC +5:30</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Response</p>
              <p className="font-display text-xl">Within 48h</p>
            </div>
          </div>
        </div>
      </div>

      <footer ref={footerRef} className="container relative z-10 mt-32 pt-8 border-t border-border flex items-center justify-center text-center">
        <p
          ref={footerLineRef}
          className="font-mono text-xs text-muted-foreground inline-flex items-center justify-center gap-2 opacity-0"
        >
          (c) 2026 - Gaurav Shekhawat - Crafted with care
          <Heart ref={heartRef} className="h-3.5 w-3.5 fill-terracotta text-terracotta" aria-hidden="true" />
        </p>
      </footer>
    </section>
  );
};

export default Contact;
