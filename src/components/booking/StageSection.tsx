"use client";

import React from 'react';
import { cn } from "../../lib/utils";
import { STAGES } from '../../constants/booking';

interface StageSectionProps {
  selectedStage: string;
  onSelect: (id: string) => void;
}

const StageSection = ({ selectedStage, onSelect }: StageSectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
      {STAGES.map((s, idx) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className={cn(
            "relative flex flex-col p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 group text-left",
            selectedStage === s.id
              ? "border-vugia-navy bg-vugia-navy/5 shadow-md ring-1 ring-vugia-navy/20"
              : "border-vugia-sand bg-white hover:border-vugia-navy/30 hover:bg-vugia-accent/10 active:scale-[0.98]"
          )}
        >
          {/* Header: Icon + Title + Number (Gộp chung 1 hàng để tiết kiệm diện tích) */}
          <div className="flex items-center gap-3 mb-2">
            <div className="text-[24px] md:text-[26px] flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-[15px] md:text-[16px] font-extrabold leading-tight transition-colors truncate",
                selectedStage === s.id ? "text-vugia-navy" : "text-slate-800"
              )}>
                {s.title}
              </h3>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                Giai đoạn 0{idx + 1}
              </span>
            </div>
          </div>

          {/* Description: Thu gọn khoảng cách */}
          <p className="text-[12px] md:text-[13px] text-slate-500 leading-snug mb-3 line-clamp-2">
            {s.desc}
          </p>

          {/* Incentive: Dòng quyền lợi tinh tế */}
          <div className={cn(
            "mt-auto pt-2.5 border-t border-dashed w-full text-[11px] md:text-[12px] font-bold flex items-center gap-1.5",
            selectedStage === s.id ? "text-vugia-gold border-vugia-navy/20" : "text-vugia-gold/80 border-vugia-sand"
          )}>
            <span className="text-[14px] leading-none">→</span>
            <span className="truncate">{s.inc}</span>
          </div>

          {/* Checkmark indicator khi được chọn */}
          {selectedStage === s.id && (
            <div className="absolute top-3 right-3 w-2 h-2 bg-vugia-navy rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

export default StageSection;