import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { featuredProjects } from "@/data/projects";
import { resetScrollForNavigation } from "@/lib/scroll";

const mainProjectSlugs = [
  "scratch-pixel",
  "scratch-pixel-admin",
  "gaurav-organics",
  "purniq-management",
  "gaurav-organics-kiosk",
  "shekhawat-market",
];

const mainProjects = featuredProjects
  .filter((project) => mainProjectSlugs.includes(project.slug))
  .sort((a, b) => mainProjectSlugs.indexOf(a.slug) - mainProjectSlugs.indexOf(b.slug));

const Projects = () => (
  <section id="work" className="py-32">
    <div className="container">
      <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-6">
            Selected work - 2024 / 26
          </p>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-balance">
            A small archive of <em className="italic font-light text-sage">labors</em> of love.
          </h2>
        </div>
        <Link
          to="/archive"
          className="font-mono text-xs uppercase tracking-wider underline underline-offset-4 hover:text-terracotta"
        >
          View full archive
        </Link>
      </div>

      <div className="space-y-6">
        {mainProjects.map((project, index) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: index * 0.05 }}
          >
            <Link
              to={`/projects/${project.slug}`}
              onClick={resetScrollForNavigation}
              className="group block"
            >
              <div className="grid md:grid-cols-12 xl:grid-cols-[560px_minmax(0,1fr)] gap-6 items-stretch">
                <div className={`md:col-span-5 xl:col-span-1 aspect-[4/3] md:aspect-auto md:h-[360px] lg:h-[380px] xl:w-[560px] rounded-3xl relative overflow-hidden shadow-card flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br ${project.color} ${
                  project.year.toLowerCase() === "latest" ? "ring-2 ring-terracotta ring-offset-8 ring-offset-background shadow-[0_0_40px_rgba(226,114,91,0.3)]" : ""
                }`}>
                  <div className="absolute inset-0 grain opacity-50 pointer-events-none" />
                  
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="relative z-10 w-full h-full object-contain rounded-xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  
                  <div className={`absolute top-6 left-6 font-mono text-xs uppercase tracking-wider text-white drop-shadow z-20 ${
                    project.year.toLowerCase() === "latest" ? "bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/40 animate-pulse" : ""
                  }`}>
                    {project.year}
                  </div>
                  <div className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-cream/95 flex items-center justify-center group-hover:rotate-45 group-hover:bg-terracotta group-hover:text-cream transition-all duration-500 z-20 shadow-soft">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
                <div className="md:col-span-7 xl:col-span-1 flex flex-col justify-between p-2 md:p-8 border-b border-border md:border-none pb-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      {project.category}
                    </p>
                    <h3 className="font-display text-4xl md:text-6xl leading-tight tracking-tight group-hover:text-terracotta transition-colors duration-500">
                      {project.title}
                    </h3>
                    <p className="mt-4 text-muted-foreground max-w-md">{project.desc}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full bg-card border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          to="/archive"
          onClick={resetScrollForNavigation}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream shadow-soft transition-colors hover:bg-terracotta"
        >
          View all projects
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default Projects;
