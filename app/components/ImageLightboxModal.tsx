"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trackBacktestImageViewed } from '@/lib/posthog';

export type ImageLightboxModalProps = {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  altPrefix: string;
  /** Strategy name shown in the modal (e.g. "NewYork–London Breakout", "Grid") */
  strategyName?: string;
  /** Trading pair shown in the modal (e.g. "EURUSD", "GBPUSD") */
  tradingPair?: string;
};

const SWIPE_THRESHOLD = 50;

export function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex,
  altPrefix,
  strategyName,
  tradingPair,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync index when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), images.length - 1));
      if (strategyName) trackBacktestImageViewed(strategyName);
    }
  }, [isOpen, initialIndex, images.length, strategyName]);

  // Lock body scroll when open so page position is preserved on close
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);
  const goToNext = useCallback(() => {
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  // ESC to close, arrow keys to navigate
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    },
    [isOpen, onClose, goToPrev, goToNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const alt = `${altPrefix} - Backtesting Result ${currentIndex + 1}`;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 animate-fade-in"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header: strategy name + trading pair */}
      {(strategyName ?? tradingPair) && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-4 py-4 pr-20 md:px-8 md:py-5 md:pr-24">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
            {strategyName && (
              <span className="text-lg font-semibold text-white md:text-xl">
                {strategyName}
              </span>
            )}
            {tradingPair && (
              <span className="text-sm font-medium text-amber-400 uppercase tracking-wider md:text-base">
                {tradingPair}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
          aria-label="Previous image"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image container - click doesn't close */}
      <div
        className="relative flex items-center justify-center w-full h-full p-4 md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={alt}
          className="max-w-full max-h-full w-auto h-auto object-contain select-none"
          draggable={false}
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        />
      </div>

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
          aria-label="Next image"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 text-white/90 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
