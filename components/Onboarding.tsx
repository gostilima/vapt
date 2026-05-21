'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Sparkles, Navigation, ShieldCheck, MapPin, Truck } from 'lucide-react';
import Logo from './Logo';

interface OnboardingProps {
  onComplete: () => void;
}

// 1. Route Illustration for Slide 0 (Balsas region smart route)
const RouteIllustration = () => (
  <div className="relative w-36 h-36 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-900/15 overflow-hidden" id="illustration-route">
    {/* Dynamic Background Pulse Circles */}
    <motion.div 
      animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.2, 0.45, 0.2] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className="absolute inset-2 rounded-full border border-dashed border-white/30"
    />
    <motion.div 
      animate={{ scale: [1, 1.35, 1], opacity: [0.1, 0.25, 0.1] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
      className="absolute -inset-2 rounded-full border border-white/10"
    />
    
    {/* Trace Path curves with dash offsets */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none -rotate-12" viewBox="0 0 144 144">
      <motion.path
        d="M 32,108 Q 72,36 112,108"
        fill="none"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5,6"
        animate={{ strokeDashoffset: [0, -22] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
    </svg>

    {/* Dispatch Hub indicator */}
    <motion.div 
      animate={{ scale: [0.95, 1.05, 0.95] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      className="absolute bottom-6 left-6 bg-white/15 backdrop-blur-md p-1.5 rounded-xl border border-white/20"
    >
      <MapPin className="w-4 h-4 text-white" />
    </motion.div>

    {/* Moving Arrow Navigation Vector with trace trails */}
    <motion.div 
      animate={{ 
        x: [-32, 32, -32], 
        y: [32, -32, 32],
        rotate: [15, 45, 15]
      }}
      transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      className="absolute bg-white/95 text-indigo-900 p-2.5 rounded-xl shadow-xl z-10"
    >
      <Navigation className="w-5 h-5 text-indigo-600" />
    </motion.div>

    {/* Target Point badge */}
    <motion.div 
      animate={{ scale: [0.9, 1.1, 0.9] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.2 }}
      className="absolute top-6 right-6 bg-amber-400 p-1.5 rounded-xl text-indigo-950 font-extrabold text-[9px] shadow-lg shadow-amber-500/20"
    >
      Balsas
    </motion.div>

    {/* Speed banner indicator */}
    <div className="absolute bottom-2 bg-black/30 backdrop-blur-sm text-[8px] tracking-wider text-white/95 font-semibold px-2 py-0.5 rounded-full uppercase border border-white/10">
      Entrega Rápida
    </div>
  </div>
);

// 2. Shared Cargo Network illustration for Slide 1 (Carga Ociosa)
const FreightIllustration = () => (
  <div className="relative w-36 h-36 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl shadow-indigo-900/15 overflow-hidden" id="illustration-freight">
    {/* Network Ring Radar Orbits */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      className="absolute inset-2 rounded-full border border-dashed border-white/10"
    />
    
    {/* Connector SVG Lines between items */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 144 144">
      <line x1="32" y1="44" x2="72" y2="72" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" strokeDasharray="4,4" />
      <line x1="112" y1="44" x2="72" y2="72" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" strokeDasharray="4,4" />
      <line x1="72" y1="112" x2="72" y2="72" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" strokeDasharray="4,4" />
    </svg>

    {/* Center Box with glowing Sparkle and premium aura */}
    <motion.div 
      animate={{ y: [-3, 3, -3] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      className="absolute bg-white text-indigo-950 p-3 h-12 w-12 rounded-2xl shadow-xl border border-indigo-100/20 z-20 flex items-center justify-center"
    >
      <div className="relative">
        <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
        <motion.span 
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white"
        />
      </div>
    </motion.div>

    {/* Linked Crate A (Top-Left) */}
    <motion.div 
      animate={{ x: [-2, 3, -2], y: [1, -3, 1] }}
      transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
      className="absolute top-5 left-3 bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded-lg border border-white/10 shadow-lg text-[9px] font-bold"
    >
      Encomenda #1
    </motion.div>

    {/* Linked Crate B (Top-Right) */}
    <motion.div 
      animate={{ x: [3, -2, 3], y: [-2, 2, -2] }}
      transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.8 }}
      className="absolute top-5 right-3 bg-white/15 backdrop-blur-md text-white px-2 py-1 rounded-lg border border-white/10 shadow-lg text-[9px] font-bold"
    >
      Encomenda #2
    </motion.div>

    {/* Shared Hub banner */}
    <motion.div 
      animate={{ scale: [0.95, 1.05, 0.95] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      className="absolute bottom-2 bg-emerald-500/90 text-white text-[9px] font-extrabold tracking-tight px-3 py-0.5 rounded-full shadow"
    >
      Frete Compartilhado
    </motion.div>
  </div>
);

// 3. Transparent pricing receipt illustration for Slide 2 (Preço Transparente)
const PricingIllustration = () => (
  <div className="relative w-36 h-36 flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl shadow-xl shadow-blue-950/20 overflow-hidden" id="illustration-pricing">
    {/* Background warm glowing amber radial beam */}
    <div className="absolute inset-4 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
    
    {/* Physical/Digital ledger receipt base */}
    <motion.div 
      animate={{ y: [-2, 2, -2], rotate: [-0.5, 0.5, -0.5] }}
      transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
      className="absolute bg-white/95 p-3 rounded-2xl shadow-xl w-24 h-28 flex flex-col justify-between border border-white/40"
    >
      <div className="space-y-1.5 antialiased">
        <div className="h-2 w-10 bg-slate-300 rounded-full" />
        <div className="h-1 bg-slate-200 rounded-full w-full" />
        <div className="h-1 bg-slate-200 rounded-full w-4/5" />
        <div className="h-1 bg-slate-200 rounded-full w-2/3" />
      </div>

      <div className="border-t border-dashed border-slate-200 pt-2 mt-2 flex justify-between items-center">
        <div className="h-1 bg-indigo-500/80 rounded-full w-6" />
        <span className="text-[10px] font-black text-indigo-700 font-mono">100% OK</span>
      </div>
    </motion.div>

    {/* Shield Check Badge floating on foreground */}
    <motion.div 
      animate={{ scale: [0.95, 1.05, 0.95], y: [2, -2, 2] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.3 }}
      className="absolute bottom-4 right-3 bg-indigo-900 text-white p-2.5 rounded-2xl shadow-xl border border-white/20 z-10"
    >
      <ShieldCheck className="w-6 h-6 text-amber-400" />
    </motion.div>

    {/* Floating Coin currencies elements */}
    <motion.div 
      animate={{ y: [0, -6, 0], rotate: [0, 20, 0] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      className="absolute top-4 left-3 bg-amber-400 text-indigo-950 font-black text-[10px] w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-lg border border-white"
    >
      R$
    </motion.div>

    <motion.div 
      animate={{ y: [-5, 2, -5] }}
      transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-10 left-3 bg-white text-indigo-950 font-bold text-[8px] px-1.5 py-0.5 rounded-lg shadow border border-indigo-100"
    >
      Zero Taxas
    </motion.div>
  </div>
);

const slides = [
  {
    prefix: "RÁPIDO E ECONÔMICO",
    title: "Transporte inteligente em Balsas e região",
    description: "Envie de uma encomenda pequena a grandes cargas com economia extraordinária e segurança.",
    icon: Navigation,
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    prefix: "PREENCHA SUA CARGA OCIOSA",
    title: "Frete Conjunto Inteligente",
    description: "Encontre motoristas que já estão de saída e pague apenas pelo espaço exato que sua carga ocupar.",
    icon: Sparkles,
    gradient: "from-indigo-600 to-blue-700",
  },
  {
    prefix: "COMPROMISSO VAPT",
    title: "Cálculo de Preço Transparente",
    description: "Preço calculado automaticamente por peso e distância, direto no aplicativo. Sem taxas surpresas.",
    icon: ShieldCheck,
    gradient: "from-blue-700 to-blue-900",
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="flex flex-col min-h-screen justify-between p-6 bg-slate-50 relative overflow-hidden" id="onboarding-wrapper">
      {/* Background blobs for premium minimalist aura */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-vapt-light opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-100 opacity-60 blur-3xl pointer-events-none" />

      {/* Header element */}
      <div className="flex items-center justify-between z-10" id="onboarding-header">
        <Logo showText size={40} />
        {currentSlide < slides.length - 1 && (
          <button 
            onClick={handleSkip}
            className="text-sm font-medium text-gray-400 hover:text-vapt transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/60"
            id="onboarding-skip-btn"
          >
            Pular
          </button>
        )}
      </div>

      {/* Main Slide Carousel Block */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-12 z-10" id="onboarding-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
            id={`onboarding-slide-${currentSlide}`}
          >
            {/* Highly customized, premium custom animations - non-standard layout! */}
            <div className="mb-8 flex items-center justify-center" id="slide-icon-wrapper">
              {currentSlide === 0 && <RouteIllustration />}
              {currentSlide === 1 && <FreightIllustration />}
              {currentSlide === 2 && <PricingIllustration />}
            </div>

            <span className="text-xs font-bold tracking-wider text-vapt opacity-80 uppercase mb-3">
              {slides[currentSlide].prefix}
            </span>

            <h1 className="text-3xl font-display font-extrabold text-vapt-dark leading-tight tracking-tight mb-4">
              {slides[currentSlide].title}
            </h1>

            <p className="text-gray-600 text-base leading-relaxed font-sans max-w-sm font-light">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls: page indicator points & action buttons */}
      <div className="flex flex-col gap-6 max-w-md mx-auto w-full z-10" id="onboarding-footer">
        {/* Progress dots */}
        <div className="flex justify-center gap-2" id="onboarding-indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-vapt' : 'w-2.5 bg-gray-300'
              }`}
              style={{ backgroundColor: idx === currentSlide ? '#093B84' : '#D1D5DB' }}
              aria-label={`Ir para slide ${idx + 1}`}
              id={`onboarding-dot-${idx}`}
            />
          ))}
        </div>

        {/* Action Call for Primary Button */}
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-vapt hover:bg-vapt-dark text-white font-medium rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] group cursor-pointer"
          style={{ backgroundColor: '#093B84' }}
          id="onboarding-action-btn"
        >
          <span>
            {currentSlide === slides.length - 1 ? 'Começar Agora' : 'Próximo'}
          </span>
          {currentSlide === slides.length - 1 ? (
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          ) : (
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
}

