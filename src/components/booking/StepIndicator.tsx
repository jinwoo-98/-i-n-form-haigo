"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from "../../lib/utils";

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
  onStepClick?: (step: number) => void;
  completedSteps: Set<number>;
}

const StepIndicator = ({ current, total, labels, onStepClick, completedSteps }: StepIndicatorProps) => {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="w-full bg-white border-b border-vugia-sand/60 pb-4 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <div className="text-[10px] font-bold text-vugia-gold uppercase tracking-[0.18em]">
            Bước {current + 1} / {total}
          </div>
          <div className="text-[15px] md:text-[16px] font-extrabold text-vugia-navy mt-0.5 leading-tight">
            {labels[current]}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-vugia-gold uppercase tracking-wider">Hoàn thành</div>
          <div className="text-[15px] md:text-[16px] font-extrabold text-vugia-navy tabular-nums">{Math.round(progress)}%</div>
        </div>
      </div>

      {/* Progress bar with step dots */}
      <div className="relative px-0.5">
        <div className="h-1.5 bg-vugia-sand/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vugia-navy to-vugia-navy/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between absolute inset-0 -top-1">
          {Array.from({ length: total }).map((_, i) => {
            const isDone = completedSteps.has(i);
            const isCurrent = i === current;
            const isClickable = onStepClick && (isDone || i < current);
            return (
              <button
                key={i}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(i)}
                className={cn(
                  "w-3 h-3 rounded-full border-2 transition-all flex items-center justify-center",
                  isCurrent
                    ? "bg-vugia-navy border-vugia-navy scale-110 shadow-sm"
                    : isDone
                      ? "bg-vugia-navy border-vugia-navy"
                      : "bg-white border-vugia-sand",
                  isClickable && "cursor-pointer hover:scale-110"
                )}
                aria-label={`Bước ${i + 1}`}
              >
                {isDone && !isCurrent && <Check className="w-2 h-2 text-white" strokeWidth={4} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;