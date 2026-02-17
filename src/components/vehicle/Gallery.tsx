import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'
import type { VehicleImage } from '../../types'
import { useLanguage } from '../../context/LanguageContext'

interface GalleryProps {
  images: VehicleImage[]
  title: string
  gradient?: string
}

const SWIPE_THRESHOLD = 56

function isGradientImage(value: string) {
  return /\bgradient\(/i.test(value)
}

function getImageKey(image: VehicleImage, index: number) {
  return `${index}-${image.order}-${image.url}`
}

export default function Gallery({ images, title, gradient }: GalleryProps) {
  const { dir } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const fullscreenThumbRefs = useRef<Array<HTMLButtonElement | null>>([])

  const galleryImages = useMemo<VehicleImage[]>(() => {
    if (images.length === 0) {
      return [{
        url: gradient || 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
        alt: title,
        order: 0,
      }]
    }

    return [...images].sort((a, b) => a.order - b.order)
  }, [images, gradient, title])

  const hasMultipleImages = galleryImages.length > 1

  const activeIndex = Math.min(current, galleryImages.length - 1)

  const goTo = useCallback((index: number) => {
    setCurrent(() => {
      if (galleryImages.length === 0) return 0
      const normalized = ((index % galleryImages.length) + galleryImages.length) % galleryImages.length
      return normalized
    })
  }, [galleryImages.length])

  const navigate = useCallback((direction: 1 | -1) => {
    goTo(activeIndex + direction)
  }, [activeIndex, goTo])

  const openFullscreen = (index = activeIndex) => {
    goTo(index)
    setFullscreen(true)
  }

  useEffect(() => {
    if (!fullscreen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false)
        return
      }

      if (!hasMultipleImages) return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        navigate(dir === 'rtl' ? 1 : -1)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        navigate(dir === 'rtl' ? -1 : 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [dir, fullscreen, hasMultipleImages, navigate])

  useEffect(() => {
    if (!fullscreen || !hasMultipleImages) return
    fullscreenThumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeIndex, fullscreen, hasMultipleImages])

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!hasMultipleImages || touchStartX.current === null) return

    const deltaX = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
    navigate(deltaX > 0 ? -1 : 1)
  }

  const currentImage = galleryImages[activeIndex]

  const renderImage = (image: VehicleImage, mode: 'cover' | 'contain' | 'thumb') => {
    if (isGradientImage(image.url)) {
      return (
        <div className="absolute inset-0" style={{ background: image.url }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.12),transparent_55%)]" />
        </div>
      )
    }

    return (
      <img
        src={image.url}
        alt={image.alt || title}
        loading={mode === 'cover' ? 'eager' : 'lazy'}
        draggable={false}
        className={`w-full h-full select-none ${
          mode === 'contain' ? 'object-contain' : 'object-cover'
        }`}
      />
    )
  }

  return (
    <>
      {/* Main gallery */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden group border border-white/[0.04] bg-cc-black-800">
        <button
          type="button"
          onClick={() => openFullscreen(activeIndex)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label="Open fullscreen image viewer"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={getImageKey(currentImage, activeIndex)}
            initial={{ opacity: 0.85, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {renderImage(currentImage, 'cover')}
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-cc-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-cc-black/35 via-transparent to-cc-black/35 pointer-events-none" />

        {/* Center brand watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="font-display text-4xl md:text-7xl tracking-[0.3em] text-white/30 select-none">
            {title.split(' ').slice(1, 3).join(' ')}
          </span>
        </div>

        {/* Navigation arrows */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 rtl:left-auto rtl:right-3 md:rtl:right-4 flex items-center justify-center w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm border border-white/10 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 rtl:right-auto rtl:left-3 md:rtl:left-4 flex items-center justify-center w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm border border-white/10 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={() => openFullscreen(activeIndex)}
          className="absolute top-3 right-3 md:top-4 md:right-4 rtl:right-auto rtl:left-3 md:rtl:left-4 z-20 flex items-center justify-center w-9 h-9 rounded bg-black/55 backdrop-blur-sm border border-white/10 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/70"
          aria-label="Open fullscreen image viewer"
        >
          <Expand size={16} />
        </button>

        {/* Image counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 rtl:right-auto rtl:left-3 md:rtl:left-4 z-20 px-3 py-1 text-xs font-medium tracking-wider rounded-full bg-black/55 backdrop-blur-sm border border-white/10 text-white/90">
            {activeIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="mt-3 md:mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {galleryImages.map((image, index) => (
          <button
            key={getImageKey(image, index)}
            type="button"
            onClick={() => openFullscreen(index)}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
              index === activeIndex
                ? 'ring-2 ring-cc-red shadow-[0_0_0_1px_rgba(200,16,46,0.35)]'
                : 'ring-1 ring-white/10 hover:ring-white/30'
            }`}
            aria-label={`Open image ${index + 1} in fullscreen`}
          >
            <div className="relative aspect-[4/3] bg-cc-black-800">
              {renderImage(image, 'thumb')}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-cc-black/96 backdrop-blur-xl"
            onClick={() => setFullscreen(false)}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,16,46,0.12)_0%,rgba(5,5,5,0)_65%)] pointer-events-none" />

            <div
              className="relative h-full w-full flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 md:px-8 pt-4 md:pt-6 pb-3">
                <div className="text-xs md:text-sm tracking-[0.16em] uppercase text-white/70">
                  {activeIndex + 1} / {galleryImages.length}
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cc-red"
                  aria-label="Close image viewer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 min-h-0 px-3 md:px-8 pb-3 md:pb-4">
                <div
                  className="relative h-full w-full rounded-xl overflow-hidden border border-white/10 bg-cc-black-800/70"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`fullscreen-${getImageKey(currentImage, activeIndex)}`}
                      initial={{ opacity: 0.82, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.8, scale: 1.01 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center p-3 md:p-6"
                    >
                      <div className="relative w-full h-full">
                        {renderImage(currentImage, 'contain')}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3 md:rtl:right-4 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/45 border border-white/15 text-white hover:bg-black/65 transition-colors cursor-pointer"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(1)}
                        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3 md:rtl:left-4 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/45 border border-white/15 text-white hover:bg-black/65 transition-colors cursor-pointer"
                        aria-label="Next image"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {hasMultipleImages && (
                <div className="px-3 md:px-8 pb-4 md:pb-6">
                  <div className="gallery-scroll flex items-center gap-2 md:gap-3 overflow-x-auto py-1">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`fullscreen-thumb-${getImageKey(image, index)}`}
                        ref={node => {
                          fullscreenThumbRefs.current[index] = node
                        }}
                        type="button"
                        onClick={() => goTo(index)}
                        className={`relative shrink-0 w-20 sm:w-24 md:w-28 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          index === activeIndex
                            ? 'ring-2 ring-cc-red'
                            : 'ring-1 ring-white/20 hover:ring-white/45 opacity-80 hover:opacity-100'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <div className="relative aspect-[4/3] bg-cc-black-700">
                          {renderImage(image, 'thumb')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
