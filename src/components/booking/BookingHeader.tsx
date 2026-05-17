"use client";

import React from 'react';
import { Phone } from 'lucide-react';

const BookingHeader = () => {
  const phoneNumber = "0908.386.258";
  const telLink = "tel:0908386258";

  return (
    <header className="w-full max-w-2xl mx-auto mb-5">
      <div className="flex items-center justify-between gap-3 px-1">
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {/* Logo Container - Trích xuất icon từ phần trên của ảnh dọc */}
          <div className="w-12 h-12 md:w-15 md:h-15 rounded-xl bg-white flex items-center justify-center shadow-sm border border-vugia-sand/60 flex-shrink-0 overflow-hidden p-0.5">
            <img
              src="/Logo Sophia Concept 2-1.png"
              alt="SOPHIA CONCEPT"
              className="w-full h-full object-cover object-top scale-110"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/100x100?text=SC';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="text-[17px] md:text-[22px] font-bold text-vugia-navy leading-none tracking-tight uppercase">
              SOPHIA CONCEPT
            </div>
            <div className="text-[10px] md:text-[11px] text-vugia-gold font-bold italic mt-1 tracking-wide">
              We Craft, You Shape
            </div>
          </div>
        </div>

        {/* Hotline Button - Đã sửa lỗi ẩn số điện thoại */}
        <a
          href={telLink}
          className="flex items-center gap-2 bg-white border border-vugia-sand hover:border-vugia-navy/30 hover:shadow-md rounded-full pl-1.5 pr-3.5 py-1.5 transition-all active:scale-95 flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-vugia-navy flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-[8px] md:text-[9px] text-vugia-gold font-bold uppercase tracking-wider">Hotline 24/7</div>
            <div className="text-[13px] md:text-[15px] font-extrabold text-vugia-navy tabular-nums">
              {phoneNumber}
            </div>
          </div>
        </a>
      </div>
    </header>
  );
};

export default BookingHeader;