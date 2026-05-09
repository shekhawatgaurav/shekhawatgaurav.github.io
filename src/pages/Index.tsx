import Nav from "@/components/portfolio/Nav";
import Hero from "@/components/portfolio/Hero";
import Marquee from "@/components/portfolio/Marquee";
import About from "@/components/portfolio/About";
import Services from "@/components/portfolio/Services";
import Projects from "@/components/portfolio/Projects";
import Skills from "@/components/portfolio/Skills";
import Experience from "@/components/portfolio/Experience";
import Contact from "@/components/portfolio/Contact";
import ScrollToTop from "@/components/ScrollToTop";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Gaurav Shekhawat | Web & App Developer Portfolio";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      'content',
      'Portfolio of Gaurav Shekhawat, a web and app developer building polished stores, dashboards, kiosk flows, property portals, and mobile app experiences.'
    );
  }, []);

  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <Projects />
      <Skills />
      <Experience />
      <Contact />
      <ScrollToTop />
    </main>
  );
};

export default Index;
