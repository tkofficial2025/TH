/**
 * 物件詳細の写真ギャラリー
 * - デスクトップ: 左に1枚メイン、右に2x2の4枚。「+ N Photos」でライトボックスを開く
 * - モバイル: メイン1枚＋2枚目以降は小さく横スクロール。タップでライトボックス・スワイプで切り替え
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getPropertyImageUrl } from '@/lib/propertyImageUrl';

export interface PropertyGalleryProps {
  /** メイン + 追加の順の写真URL配列 */
  photos: string[];
  /** 物件名（alt 等） */
  alt: string;
  /** 「+ N Photos」の文言（例: "See all photos"） */
  seeAllLabel?: (count: number) => string;
}

export function PropertyGallery({ photos, alt, seeAllLabel }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = photos.length;
  const hasPhotos = total > 0;
  const mainUrl = photos[0] ?? '';
  const rightGridPhotos = photos.slice(1, 4);
  const restCount = Math.max(0, total - 4);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
    setLightboxOpen(true);
  }, [total]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? total - 1 : i - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= total - 1 ? 0 : i + 1));
  }, [total]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    },
    [lightboxOpen, closeLightbox, goPrev, goNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!hasPhotos) {
    return (
      <div className="aspect-[16/10] rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
        No photos
      </div>
    );
  }

  const defaultSeeAll = (n: number) => `+ ${n} Photos`;

  return (
    <>
      {/* モバイル: メイン1枚 ＋ 2枚目以降は小さく横スクロール */}
      <div className="md:hidden space-y-2">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-200 text-left focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2"
        >
          <ImageWithFallback
            src={getPropertyImageUrl(mainUrl, 'detail')}
            alt={alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </button>
        {photos.length > 1 && (
          <div className="overflow-x-auto pb-1 -mx-1">
            <div className="flex gap-2 min-w-0">
              {photos.slice(1).map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openLightbox(i + 1)}
                  className="flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2"
                >
                  <ImageWithFallback
                    src={getPropertyImageUrl(url, 'detail')}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* デスクトップ: 左1大 + 右2x2（メインはアスペクト固定で見切れ防止） */}
      <div className="hidden md:grid rounded-xl overflow-hidden grid-cols-2 gap-2 md:gap-2.5">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 text-left focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2"
        >
          <ImageWithFallback
            src={getPropertyImageUrl(mainUrl, 'detail')}
            alt={alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </button>
        <div className="grid grid-cols-2 gap-2 md:gap-2.5">
          {rightGridPhotos.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openLightbox(i + 1)}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2"
            >
              <ImageWithFallback
                src={getPropertyImageUrl(url, 'detail')}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {restCount > 0 ? (
            <button
              type="button"
              onClick={() => openLightbox(4)}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2"
            >
              <span className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm md:text-base">
                {(seeAllLabel ?? defaultSeeAll)(restCount)}
              </span>
            </button>
          ) : photos[3] ? (
            <button
              type="button"
              onClick={() => openLightbox(3)}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2"
            >
              <ImageWithFallback
                src={getPropertyImageUrl(photos[3], 'detail')}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ) : null}
        </div>
      </div>

      {/* ライトボックス（全画面・矢印・カウンター・サムネストリップ・スワイプ対応） */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0 relative px-12 md:px-16">
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              className="relative w-full h-full max-h-[60vh] flex items-center justify-center touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <ImageWithFallback
                src={getPropertyImageUrl(photos[currentIndex] ?? '', 'detail')}
                alt={`${alt} (${currentIndex + 1} of ${total})`}
                className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
              />
            </div>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="shrink-0 overflow-x-auto py-3 px-4 border-t border-white/10">
            <div className="flex gap-2 justify-center min-w-max">
              {photos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === currentIndex ? 'border-white ring-2 ring-white/50' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={getPropertyImageUrl(url, 'listing')}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
