"use client";

import React from 'react';
import { Phone } from 'lucide-react';

const BookingHeader = () => {
  return (
    <header className="w-full max-w-2xl mx-auto mb-4">
      <div className="flex items-center justify-between gap-3 px-1">
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center shadow-sm border border-vugia-sand/80 flex-shrink-0 p-1.5">
            <img
              src="/logo-vugia.png"
              alt="SOPHIA CONCEPT Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[18px] md:text-[20px] font-bold text-vugia-navy leading-none tracking-tight uppercase">
              SOPHIA CONCEPT
            </div>
            <div className="text-[10px] md:text-[11px] text-vugia-gold font-bold italic mt-1 tracking-wide">
              We Craft, You Shape
            </div>
          </div>
        </div>

        {/* Hotline Button */}
        <a
          href="tel:0357412590"
          className="flex items-center gap-2 bg-white border border-vugia-sand hover:border-vugia-navy/30 hover:shadow-md rounded-full pl-2 pr-4 py-2 transition-all active:scale-95 flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-vugia-navy flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div className="text-left leading-tight hidden xs:block">
            <div className="text-[9px] text-vugia-gold font-bold uppercase tracking-wider">Hotline 24/7</div>
            <div className="text-[13px] md:text-[15px] font-extrabold text-vugia-navy tabular-nums">0357.412.590</div>
          </div>
        </a>
      </div>
    </header>
  );
};

export default BookingHeader;