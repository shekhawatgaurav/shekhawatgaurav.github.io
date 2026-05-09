import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import HeroIllustration from "./HeroIllustration";

const About = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  return (
    <section id="about" ref={ref} className="relative py-32 overflow-hidden">
      <div className="container grid md:grid-cols-12 gap-12 items-center">
        <motion.div
          style={{ y, rotate }}
          className="md:col-span-5 relative"
        >
          <HeroIllustration />
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-butter shadow-card animate-float-slow flex items-center justify-center font-display text-xs text-center leading-tight">
            Let's<br />build
          </div>
        </motion.div>

        <div className="md:col-span-7 md:pl-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-6"
          >
            About
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl md:text-6xl leading-tight tracking-tight text-balance"
          >
            I turn curious ideas into <em className="italic font-light text-sage">interfaces that feel alive</em> - pixels, code, and a touch of physics.
          </motion.h2>

          <div className="mt-10 grid sm:grid-cols-2 gap-6 text-muted-foreground">
            <p>
              Over the past few years, I've transitioned from building simple websites to engineering full-stack applications and comprehensive management dashboards that solve real problems.
            </p>
            <p>
              My workflow blends modern web technologies with an exploration of AI-assisted tools to speed up development, craft engaging UI/UX, and bring <span className="text-ink font-medium">amazing ideas</span> to life.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {["Jaipur, India", "Full-Stack Dev", "AI Explorer", "UI/UX Design", "Problem Solver"].map((t) => (
              <span key={t} className="px-4 py-1.5 rounded-full bg-card border border-border text-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
