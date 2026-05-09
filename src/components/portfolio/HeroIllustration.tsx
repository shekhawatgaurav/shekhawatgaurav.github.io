import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroIllustration = () => {
  return (
    <div className="relative aspect-[4/5] rounded-3xl bg-gradient-aurora overflow-hidden shadow-glow">
      <img 
        src={`${import.meta.env.BASE_URL}hero1.png`} 
        alt="About me" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 right-4 bg-cream/90 backdrop-blur rounded-xl p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">Currently</p>
        <p className="font-display text-base leading-tight">Exploring AI-assisted development & <span className="text-terracotta">startup ideas</span></p>
      </div>
    </div>
  );
};

export default HeroIllustration;
