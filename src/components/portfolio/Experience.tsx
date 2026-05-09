import { motion } from "framer-motion";

const exp = [
  { year: "2026 — Now", role: "Full-Stack Developer & Builder", company: "Full-Stack Developer • AI-Assisted Development ", note: "• Built 10+ websites\n• Using AI tools to speed up development & problem-solving\n• Building products and exploring startup ideas" },
  { year: "2025 — 2026", role: "Web Developer (Growth Phase)", company: "Web Development Growth • Real Projects", note: "• Developed multiple real-world websites\n• Improved frontend and backend fundamentals\n• Started integrating AI tools into workflow " },
  { year: "2024 — 2025", role: "Learning & First Builds", company: "First Websites • HTML, CSS, JS", note: "• Created first 2 complete websites\n• Strong foundation in HTML, CSS, JavaScript\n• Began building real-world projects " },
  { year: "2022 — 2023", role: "Programming & Design Exploration", company: "Java • Python • UI/UX", note: "• Learned Java and Python basics\n• Worked with Figma, Photoshop, Adobe XD\n• Built understanding of UI/UX design" },
  { year: "2020 — 2021", role: "Started with Web Basics", company: "Started with HTML • Blogger", note: "• Learned HTML and basic CSS\n• Created simple websites using Blogger\n• Developed initial interest in tech and building" },
];

const Experience = () => (
  <section className="py-32">
    <div className="container max-w-5xl">
      <div className="mb-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-6">✦ Trajectory</p>
        <h2 className="font-display text-5xl md:text-7xl leading-tight tracking-tight text-balance">
          A decade in <em className="italic font-light text-sage">motion</em>.
        </h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
        {exp.map((e, i) => (
          <motion.div
            key={e.year}
            initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-12 mb-12 ${i % 2 ? "md:text-left" : "md:text-right"}`}
          >
            <div className="absolute left-0 md:left-1/2 top-1.5 w-3 h-3 rounded-full bg-terracotta -translate-x-1/2 ring-4 ring-cream flex items-center justify-center">
              {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-cream" />}
            </div>
            <div className={i % 2 ? "md:col-start-2" : ""}>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">{e.year}</p>
              <h3 className="font-display text-2xl md:text-3xl leading-tight">{e.role}</h3>
              <p className="text-terracotta font-medium mt-1">{e.company}</p>
              <p className="text-muted-foreground text-sm mt-2 whitespace-pre-line">{e.note}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Experience;
