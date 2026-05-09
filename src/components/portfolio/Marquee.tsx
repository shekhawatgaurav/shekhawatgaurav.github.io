const items = [
  "React & TypeScript",
  "Flutter & Dart",
  "Kotlin",
  "Tailwind CSS",
  "E-commerce Websites",
  "Admin Dashboards",
  "Retail Kiosks",
  "Android Apps",
  "Property Portals",
  "Firebase",
  "Three.js & GSAP",
];

const Marquee = () => (
  <section className="py-6 border-y border-border bg-sand/40 overflow-hidden">
    <div className="flex marquee-track whitespace-nowrap">
      {[...items, ...items].map((item, i) => (
        <div key={i} className="flex items-center gap-8 px-6 shrink-0">
          <span className="font-display text-2xl md:text-4xl font-light text-ink/80">{item}</span>
          <span className="w-2 h-2 rounded-full bg-terracotta" />
        </div>
      ))}
    </div>
  </section>
);

export default Marquee;
