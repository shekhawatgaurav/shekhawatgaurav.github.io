import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { projects } from "@/data/projects";
import { resetScrollForNavigation } from "@/lib/scroll";

const Archive = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider hover:text-terracotta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="font-display text-2xl md:text-3xl tracking-tight">Project Archive</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="container py-20">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-4">
            All projects
          </p>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-balance">
            Complete archive of <em className="italic font-light text-sage">all work</em>
          </h2>
        </div>

        <div className="space-y-6">
          {projects.map((project, index) => (
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
                <div className="grid md:grid-cols-12 xl:grid-cols-[540px_minmax(0,1fr)] gap-6 items-stretch">
                  <div className={`md:col-span-5 xl:col-span-1 aspect-[4/3] md:aspect-auto md:h-[320px] lg:h-[340px] xl:w-[540px] rounded-3xl relative overflow-hidden shadow-card hover:shadow-lg transition-shadow duration-500 flex items-center justify-center p-6 bg-gradient-to-br ${project.color}`}>
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="relative z-10 w-full h-full object-contain rounded-xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 grain opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 grain opacity-40 pointer-events-none" />
                    <div className="absolute top-6 left-6 font-mono text-xs uppercase tracking-wider text-white drop-shadow z-20">
                      {project.year}
                    </div>
                    <div className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-cream/95 flex items-center justify-center group-hover:rotate-45 group-hover:bg-terracotta group-hover:text-cream transition-all duration-500 z-20">
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

        <div className="mt-20 pt-12 border-t border-border text-center">
          <p className="text-muted-foreground mb-6">Interested in working together?</p>
          <Link
            to="/#contact"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider underline underline-offset-4 hover:text-terracotta transition-colors"
          >
            Get in touch
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Archive;
