import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  ExternalLink,
  Github,
  Layers3,
  MonitorPlay,
  Download,
} from "lucide-react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import ScrollToTop from "@/components/ScrollToTop";
import { getProjectBySlug, projects } from "@/data/projects";
import { resetScrollForNavigation } from "@/lib/scroll";
import NotFound from "./NotFound";

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = getProjectBySlug(slug ?? "");
  const currentIndex = projects.findIndex((item) => item.slug === project?.slug);
  const nextProject = currentIndex >= 0 ? projects[(currentIndex + 1) % projects.length] : projects[0];
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const [adminStep, setAdminStep] = useState<0 | 1 | 2 | 3>(0);
  const [adminKey, setAdminKey] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    if (!project) {
      document.title = "Project not found | Gaurav Shekhawat";
      return;
    }

    document.title = `${project.title} | Project Overview`;
    const meta =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const element = document.createElement("meta");
        element.setAttribute("name", "description");
        document.head.appendChild(element);
        return element;
      })();
    meta.setAttribute("content", project.desc);
  }, [project]);

  useEffect(() => {
    setGalleryIndex(0);
    setShowAdminWarning(false);
    setAdminStep(0);
    setAdminKey("");
    setAdminError(false);
    setIsUnlocking(false);
  }, [project?.slug]);

  if (!project) {
    return <NotFound />;
  }

  const previewImages = [project.image, ...(project.galleryImages ?? [])].filter(Boolean) as string[];
  const hasPreviewGallery = previewImages.length > 1;
  const showPreviousImage = () =>
    setGalleryIndex((current) => (current - 1 + previewImages.length) % previewImages.length);
  const showNextImage = () =>
    setGalleryIndex((current) => (current + 1) % previewImages.length);

  const handleUnlock = async () => {
    if (!adminKey.trim()) return;
    setIsUnlocking(true);
    setAdminError(false);
    try {
      const secretRef = ref(db, "adminConfig/secretKey");
      const snapshot = await get(secretRef);
      
      if (snapshot.exists() && snapshot.val() === adminKey.toLowerCase().trim()) {
        setAdminStep(3);
      } else {
        setAdminError(true);
      }
    } catch (error) {
      console.error("Firebase Error:", error);
      setAdminError(true);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-5 flex items-center justify-between gap-4">
          <Link
            to="/#work"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider hover:text-terracotta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Work
          </Link>
          <Link
            to="/archive"
            className="font-mono text-xs uppercase tracking-wider hover:text-terracotta transition-colors"
          >
            Archive
          </Link>
        </div>
      </div>

      <section className="container pt-20 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-6">
              {project.year} - {project.category}
            </p>
            <h1 className="font-display text-6xl md:text-8xl leading-[0.9] tracking-tight text-balance">
              {project.title}
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              {project.desc}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            {project.liveUrl && (
              project.slug === "scratch-pixel-admin" || project.slug === "shekhawat-market" ? (
                <button
                  onClick={() => setShowAdminWarning(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-ink text-cream text-sm font-medium hover:bg-terracotta transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Live Site
                </button>
              ) : (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-ink text-cream text-sm font-medium hover:bg-terracotta transition-colors"
                >
                  {project.category.includes("Android App") ? (
                    <Download className="w-4 h-4" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  {project.category.includes("Android App") ? "Download App" : "Open Live Site"}
                </a>
              )
            )}

            {project.galleryImages?.length ? (
              <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                <MonitorPlay className="w-4 h-4" />
                Screen gallery
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                <MonitorPlay className="w-4 h-4" />
                Image preview
              </span>
            )}

            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border bg-card text-sm font-medium hover:border-terracotta hover:text-terracotta transition-colors"
              >
                <Github className="w-4 h-4" />
                View Code
              </a>
            )}

          </div>
        </div>
      </section>

      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl shadow-card bg-card border border-border">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-terracotta" />
              <span className="w-3 h-3 rounded-full bg-butter" />
              <span className="w-3 h-3 rounded-full bg-sage" />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground truncate">
            {project.galleryImages?.length ? "App screen preview" : "Image preview"}
            </p>
          </div>

          <div className={`relative aspect-[16/10] bg-gradient-to-br ${project.color}`}>
          {previewImages.length ? (
              <>
                <img
                  src={previewImages[galleryIndex]}
                  alt={`${project.title} preview ${galleryIndex + 1}`}
                  className="w-full h-full object-contain p-4"
                />
                {hasPreviewGallery && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/95 text-ink shadow-soft transition-colors hover:bg-terracotta hover:text-cream"
                      aria-label="Previous app screen"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/95 text-ink shadow-soft transition-colors hover:bg-terracotta hover:text-cream"
                      aria-label="Next app screen"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-xs font-mono text-cream">
                      {galleryIndex + 1} / {previewImages.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={`relative w-full h-full bg-gradient-to-br ${project.color}`}>
                <div className="absolute inset-0 grain opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                  <div>
                    <MonitorPlay className="w-10 h-10 mx-auto mb-4 text-cream" />
                    <p className="font-display text-3xl text-cream">Live preview will appear here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/45">
        <div className="container py-12 grid sm:grid-cols-3 gap-4">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border bg-background p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
                {metric.label}
              </p>
              <p className="font-display text-3xl text-ink">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-5">
              <div className="flex items-start gap-3">
                <Layers3 className="w-5 h-5 mt-1 text-terracotta" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Role</p>
                  <p className="mt-1">{project.role}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="w-5 h-5 mt-1 text-terracotta" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Timeline</p>
                  <p className="mt-1">{project.timeline}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code2 className="w-5 h-5 mt-1 text-terracotta" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Stack</p>
                  <div className="mt-2 flex flex-wrap gap-2">
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
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta mb-5">
                Project overview
              </p>
              <p className="text-2xl md:text-3xl leading-snug font-display text-balance">{project.overview}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="font-display text-4xl mb-4">Problem</h2>
                <p className="text-muted-foreground leading-relaxed">{project.problem}</p>
              </div>
              <div>
                <h2 className="font-display text-4xl mb-4">Solution</h2>
                <p className="text-muted-foreground leading-relaxed">{project.solution}</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-4xl mb-6">Key Features</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {project.features.map((feature) => (
                  <div key={feature} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-sage" />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-4xl mb-6">What I Worked On</h2>
              <div className="space-y-3">
                {project.responsibilities.map((item) => (
                  <div key={item} className="flex gap-3 border-b border-border pb-3">
                    <ArrowUpRight className="w-4 h-4 shrink-0 mt-1 text-terracotta" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-24">
        <Link
          to={`/projects/${nextProject.slug}`}
          onClick={resetScrollForNavigation}
          className="group block border-t border-border pt-10 hover:text-terracotta transition-colors"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Next project
          </p>
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-7xl leading-none">{nextProject.title}</h2>
            <div className="w-14 h-14 rounded-full bg-ink text-cream flex items-center justify-center group-hover:bg-terracotta group-hover:rotate-45 transition-all">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </section>

      <ScrollToTop />

      {showAdminWarning && project.liveUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            {adminStep === 0 && (
              <>
                <h3 className="font-display text-3xl mb-3 text-terracotta">Restricted Access</h3>
                <div className="text-muted-foreground mb-8 leading-relaxed space-y-3">
                  <p>Hi there! 👋</p>
                  <p>This is a restricted app dashboard. Do you have the secret access key to view the demo credentials?</p>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => setAdminStep(1)}
                    className="px-5 py-2.5 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                  >
                    No, I don't
                  </button>
                  <button
                    onClick={() => setAdminStep(2)}
                    className="px-5 py-2.5 rounded-full bg-ink text-cream text-sm font-medium hover:bg-terracotta transition-colors"
                  >
                    Yes, I have it
                  </button>
                </div>
              </>
            )}

            {adminStep === 1 && (
              <>
                <h3 className="font-display text-3xl mb-3 text-terracotta">Access Required</h3>
                <div className="text-muted-foreground mb-8 leading-relaxed space-y-3">
                  <p>Demo credentials are required to enter the app.</p>
                  <p>Please contact <strong>Gaurav</strong> to request an ID and Password for evaluation.</p>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => setShowAdminWarning(false)}
                    className="px-5 py-2.5 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {adminStep === 2 && (
              <>
                <h3 className="font-display text-3xl mb-3 text-terracotta">Enter Key</h3>
                <div className="text-muted-foreground mb-6 leading-relaxed">
                  <input
                    type="password"
                    placeholder="Secret key..."
                    className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta/50 transition-all ${
                      adminError ? "border-red-500" : "border-border"
                    }`}
                    value={adminKey}
                    onChange={(e) => {
                      setAdminKey(e.target.value);
                      setAdminError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUnlock();
                    }}
                    autoFocus
                  />
                  {adminError && <p className="text-red-500 text-xs mt-2">Invalid key. Try again.</p>}
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => setShowAdminWarning(false)}
                    className="px-5 py-2.5 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className="px-5 py-2.5 rounded-full bg-ink text-cream text-sm font-medium hover:bg-terracotta transition-colors"
                  >
                    {isUnlocking ? "Checking..." : "Unlock"}
                  </button>
                </div>
              </>
            )}

            {adminStep === 3 && (
              <>
                <h3 className="font-display text-3xl mb-3 text-sage">Access Granted 🔓</h3>
                <div className="text-muted-foreground mb-8 leading-relaxed space-y-3">
                  <p>Use these credentials to log in:</p>
                  {project.slug === "shekhawat-market" ? (
                    <div className="bg-background p-4 rounded-xl border border-border font-mono text-sm space-y-3">
                      <div>
                        <p className="text-terracotta text-xs uppercase mb-1">Admin</p>
                        <p>ID: <span className="text-foreground font-medium">shekhawatproperties1@gmail.com</span></p>
                        <p>Pass: <span className="text-foreground font-medium">123456</span></p>
                      </div>
                      <div className="h-px bg-border w-full" />
                      <div>
                        <p className="text-terracotta text-xs uppercase mb-1">Tenant</p>
                        <p>ID: <span className="text-foreground font-medium">mannvinod9785@gmail.com</span></p>
                        <p>Pass: <span className="text-foreground font-medium">vinod@9785</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-background p-4 rounded-xl border border-border font-mono text-sm space-y-1">
                      <p>ID: <span className="text-foreground font-medium">portfolio@mail.in</span></p>
                      <p>Pass: <span className="text-foreground font-medium">admin1</span></p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => setShowAdminWarning(false)}
                    className="px-5 py-2.5 rounded-full border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShowAdminWarning(false)}
                    className="px-5 py-2.5 rounded-full bg-ink text-cream text-sm font-medium hover:bg-sage transition-colors"
                  >
                    Open Live Site
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default ProjectDetail;
