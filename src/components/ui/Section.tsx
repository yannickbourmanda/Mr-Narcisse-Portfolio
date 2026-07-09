import React from 'react';
import { motion } from 'motion/react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: 'white' | 'gray' | 'navy';
}

export default function Section({ children, className = '', id, bg = 'white' }: SectionProps) {
  const backgrounds = {
    white: 'bg-navy',
    gray: 'bg-navy-light border-y border-white/5',
    navy: 'bg-navy-dark',
  };

  return (
    <section id={id} className={`py-20 lg:py-32 relative overflow-hidden ${backgrounds[bg]} ${className}`}>
      <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5 pointer-events-none hidden lg:block"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

export function SectionHeader({ title, subtitle, centered = false }: { title: string; subtitle?: string; centered?: boolean }) {
  return (
    <div className={`mb-16 ${centered ? 'flex flex-col items-center text-center' : 'flex flex-col items-start'}`}>
      {subtitle && (
        <div className={`flex items-center gap-4 mb-6 ${centered ? 'justify-center mx-auto' : ''}`}>
          {!centered && <div className="w-12 h-[1px] bg-gold"></div>}
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">
            {subtitle}
          </span>
          {centered && <div className="w-12 h-[1px] bg-gold"></div>}
        </div>
      )}
      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-2">
        {title}
      </h2>
      <div className={`w-16 h-[1px] bg-gold/50 mt-8 ${centered ? 'mx-auto' : ''}`} />
    </div>
  );
}
