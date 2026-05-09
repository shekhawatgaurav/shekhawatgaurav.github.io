import { motion } from "framer-motion";

const skills = [
  { group: "Web & App", items: ["React", "TypeScript", "JavaScript", "Flutter / Dart", "Kotlin"] },
  { group: "UI Builds", items: ["Tailwind CSS", "Mobile Apps", "Dashboards", "E-commerce", "Kiosk UI"] },
  { group: "Motion & Data", items: ["Three.js", "GSAP", "Framer Motion", "Firebase", "LocalStorage"] },
  { group: "Tools", items: ["Figma", "Android Studio", "AdMob", "GitHub", "VS Code"] },
];

const Skills = () => (
  <section className="py-32 bg-sand/50 border-y border-border">
    <div className="container">
      <div className="max-w-3xl mb-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-6">Toolkit</p>
        <h2 className="font-display text-5xl md:text-6xl leading-tight tracking-tight text-balance">
          A <em className="italic font-light text-sage">practical</em> stack for websites, dashboards, kiosks, and apps.
        </h2>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {skills.map((s, i) => (
          <motion.div
            key={s.group}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-cream rounded-2xl p-6 shadow-card border border-border/60"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-terracotta mb-4">
              0{i + 1} - {s.group}
            </p>
            <ul className="space-y-2">
              {s.items.map((item) => (
                <li key={item} className="font-display text-xl border-b border-border/50 pb-2 last:border-0">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Skills;
