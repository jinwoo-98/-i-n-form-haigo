"use client";

import React from 'react';
import { Phone } from 'lucide-react';

const BookingHeader = () => {
  return (
    <header className="w-full max-w-2xl mx-auto mb-4">
      <div className="flex items-center justify-between gap-3 px-1">
        {/* Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-vugia-sand/80 flex-shrink-0 p-1">
            <img
              src="/logo-vugia.png"
              alt="Logo SOPHIA CONCEPT"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[16px] md:text-[18px] font-extrabold text-vugia-navy leading-tight tracking-tight truncate">
              SOPHIA CONCEPT
            </div>
            <div className="text-[10px] md:text-[11px] text-vugia-gold font-semibold uppercase tracking-[0.15em] truncate">
              We Craft, You Shape
            </div>
          </div>
        </div>

        {/* Hotline — click-to-call */}
        <a
          href="tel:0357412590"
          className="flex items-center gap-2 bg-white border border-vugia-sand hover:border-vugia-navy/30 hover:shadow-md rounded-full pl-2 pr-3 py-1.5 transition-all active:scale-95 flex-shrink-0"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-vugia-accent flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-vugia-navy" fill="currentColor" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-[9px] text-vugia-gold font-bold uppercase tracking-wider">Hotline</div>
            <div className="text-[12px] md:text-[14px] font-extrabold text-vugia-navy tabular-nums">0357.412.590</div>
          </div>
        </a>
      </div>
    </header>
  );
};

export default BookingHeader;