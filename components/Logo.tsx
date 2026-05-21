'use client';

import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function Logo({ className = '', size = 48, showText = false }: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`} id="vapt-logo-container">
      <div 
        style={{ width: size, height: size }}
        className="relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-vapt"
        id="vapt-logo-graphic"
      >
        {!imgFailed ? (
          <img 
            src="/logotipo.png" 
            alt="Vapt Logo" 
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            referrerPolicy="no-referrer"
            id="vapt-logo-img"
          />
        ) : (
          /* High-Fidelity SVG Fallback Representation */
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full p-1"
          >
            {/* Inner White Frame Border */}
            <rect 
              x="6" 
              y="6" 
              width="88" 
              height="88" 
              rx="4" 
              stroke="white" 
              strokeWidth="4" 
              fill="none"
            />
            {/* Double inline vector V with speed ridges on left */}
            <path 
              d="
                M 18,25 
                L 21,27 L 18,31 
                L 22,33 L 18,37 
                L 23,39 L 18,44 
                L 24,46 L 18,51 
                L 25,53 L 18,58 
                L 26,60 L 18,65 
                L 28,67 L 18,72 
                L 29,74 L 18,79
                L 33,81
                L 44,81 
                L 82,25 
                L 70,25 
                L 39,70 
                L 29,25 
                Z
              " 
              fill="white"
            />
            {/* Speed cuts on the letter V inner hollow representation */}
            <path 
              d="
                M 33,35 
                L 38,62 
                L 64,25 
                H 59 
                L 36,58
                L 33,35 
                Z
              " 
              fill="#093B84"
              opacity="0.3"
            />
          </svg>
        )}
      </div>
      
      {showText && (
        <span 
          className="font-display font-bold tracking-tight text-vapt" 
          style={{ fontSize: size * 0.48 }}
          id="vapt-logo-text"
        >
          VAPT
        </span>
      )}
    </div>
  );
}
