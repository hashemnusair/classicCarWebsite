import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'
import type { VehicleImage } from '../../types'

interface GalleryProps {
  images: VehicleImage[]
  title: string
  gradient?: string
}

export default function Gallery({ images, title, gradient }: GalleryProps) {
  const [current, setCurrent] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const bgStyle = gradient ? { background: gradient } : { background: 'var(--color-cc-black-700)' }

  const navigate = (dir: 1 | -1) => {
    setCurrent(prev => {
      const next = prev + dir
      if (next < 0) return images.length - 1
      if (next >= images.length) return 0
      return next
    })
  }

  return (
    <>
      {/* Main gallery */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden group">
        <div className="absolute inset-0" style={bgStyle}>
          {/* Center brand watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="font-display text-5xl md:text-7xl tracking-[0.3em] text-white/30 select-none">
              {title.split(' ').slice(1, 3).join(' ')}
            </span>
          </div>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-cc-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cc-black/30 via-transparent to-cc-black/30" />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded bg-black/40 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
        >
          <Expand size={16} />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  i === current ? 'w-4 bg-cc-red' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-cc-black/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-6 right-6 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-full max-w-5xl aspect-[16/9] mx-4" style={bgStyle}>
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-4xl md:text-6xl tracking-[0.3em] text-white/20 select-none">
                  {title}
                </span>
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); navigate(-1) }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); navigate(1) }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
