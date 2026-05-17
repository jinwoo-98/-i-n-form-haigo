"use client";

import React from 'react';

interface ProgressBarProps {
  filledFields: number;
  totalFields: number;
}

const ProgressBar = ({ filledFields, totalFields }: ProgressBarProps) => {
  const progress = Math.min(100, Math.round((filledFields / totalFields) * 100));

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-bold text-vugia-gold uppercase tracking-[0.18em]">
          Tiến độ hoàn thành
        </span>
        <span className="text-[15px] font-extrabold text-vugia-navy tabular-nums">
          {progress}%
        </span>
      </div>
      <div className="h-1.5 bg-vugia-sand rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-vugia-navy to-vugia-navy/70 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
