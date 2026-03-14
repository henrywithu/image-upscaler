'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageComparisonProps {
  original: string;
  upscaled: string;
  className?: string;
}

export function ImageComparison({ original, upscaled, className }: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    
    if (position >= 0 && position <= 100) {
      setSliderPosition(position);
    }
  };

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full aspect-video rounded-lg overflow-hidden cursor-ew-resize bg-muted touch-none select-none", className)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Upscaled (Bottom) */}
      <img 
        src={upscaled} 
        alt="Upscaled" 
        className="absolute inset-0 w-full h-full object-contain" 
        draggable={false}
      />

      {/* Original (Top, Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={original} 
          alt="Original" 
          className="w-full h-full object-contain" 
          draggable={false}
        />
        <div className="absolute top-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
          Before
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-primary text-white px-2 py-1 rounded text-xs font-medium uppercase tracking-wider backdrop-blur-sm">
        After
      </div>

      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-none" 
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary">
          <MoveHorizontal className="w-4 h-4 text-primary" />
        </div>
      </div>
    </div>
  );
}