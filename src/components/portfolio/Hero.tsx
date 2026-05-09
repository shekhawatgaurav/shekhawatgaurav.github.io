import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Blob3D from "./Blob3D";

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const logos = [
  "Figma.png",
  "Illustrator.png",
  "Photoshop.png",
  "VisualStudioCode.png",
  "xd.png",
  "androidstudio.png",
  "JavaScript.png",
  "Typescript.png",
  "React.png"
];

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-mesh pt-28 text-ink sm:pt-32">
      <div className="absolute inset-0 grain opacity-30" aria-hidden="true" />

      <div className="container relative z-10 grid min-h-[calc(100vh-7rem)] gap-10 pb-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(380px,0.72fr)] lg:items-center">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12 }}
            className="mt-8 max-w-5xl font-display text-[clamp(2.8rem,8.7vw,8.4rem)] leading-[0.9] tracking-tight text-balance"
          >
            Crafting <span className="text-terracotta">soulful</span> interfaces for ambitious teams.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            I'm Gaurav – a web and app developer building polished stores, dashboards, kiosk flows, property portals, and portfolio experiences from idea to launch.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42 }}
            className="mt-9 flex flex-wrap items-center gap-5 sm:gap-6"
          >
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream shadow-soft transition-colors hover:bg-terracotta"
            >
              View selected work
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center text-sm font-medium text-ink underline decoration-terracotta underline-offset-4 transition-colors hover:text-terracotta"
            >
              Or say hello
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.58 }}
            className="mt-12 flex max-w-lg items-start gap-7 sm:gap-9"
          >
            <div className="flex min-w-0 flex-col">
              <div className="font-display text-3xl font-bold text-ink">3+</div>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Years</p>
            </div>
            <div className="mt-1 h-12 w-px shrink-0 bg-terracotta/35" aria-hidden="true" />
            <div className="flex min-w-0 flex-col">
              <div className="font-display text-3xl font-bold text-ink">10+</div>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Projects</p>
            </div>
            <div className="mt-1 h-12 w-px shrink-0 bg-terracotta/35" aria-hidden="true" />
            <div className="flex min-w-0 flex-col">
              <div className="font-display text-3xl font-bold text-ink">5+</div>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Live Builds</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[620px] hidden sm:block"
        >
        <div className="relative w-full max-w-[700px] aspect-square flex items-center justify-center">
          <div className="absolute inset-0 scale-[1.3] md:scale-150">
            <Blob3D settings={{ blobScale: 0.8, blobOffsetX: -1.5, blobOffsetY: 1.3 }} />
          </div>

          <style>{`
            .logo-orbit {
              --logo-count: 9;
              --orbit-x: 0px;
              --orbit-y: 0px;
              position: absolute;
              inset: 0;
              animation: orbit-spin 86s linear infinite;
            }
            .logo-item {
              --angle: calc(var(--i) * 360deg / var(--logo-count));
              --radius: min(31vw, 330px);
              position: absolute;
              top: 50%;
              left: 50%;
              display: grid;
              place-items: center;
              width: clamp(48px, 5vw, 74px);
              height: clamp(48px, 5vw, 74px);
              border-radius: 16px;
              background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.64));
              box-shadow: 0 22px 52px rgba(22, 26, 31, 0.16), 0 6px 16px rgba(22, 26, 31, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.88);
              backdrop-filter: blur(12px) saturate(145%);
              transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--radius)) rotate(calc(var(--angle) * -1));
            }
            .logo-item img {
              display: block; width: 68%; height: 68%; object-fit: contain;
              animation: logo-counter-spin 86s linear infinite;
            }
            @keyframes orbit-spin { from { transform: translate(var(--orbit-x), var(--orbit-y)) rotate(0deg); } to { transform: translate(var(--orbit-x), var(--orbit-y)) rotate(360deg); } }
            @keyframes logo-counter-spin { to { transform: rotate(-360deg); } }
          `}</style>
          
          <div className="logo-orbit pointer-events-none">
            {logos.map((logo, i) => (
              <div className="logo-item" style={{ '--i': i } as React.CSSProperties} key={logo}>
                <img src={publicAsset(`images/${logo}`)} alt={logo.split('.')[0]} />
              </div>
            ))}
          </div>
        </div>
        </motion.div>
      </div>

      <motion.a
        href="#work"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-terracotta md:flex"
      >
        Scroll
        <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ArrowDown className="h-4 w-4" />
        </motion.span>
      </motion.a>

    </section>
  );
};

export default Hero;
