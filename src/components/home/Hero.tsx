import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import { useLanguage } from '../../context/LanguageContext'
import {
  HERO_AUTOPLAY_ATTEMPT_WINDOW_MS,
  HERO_AUTOPLAY_RETRY_INTERVAL_MS,
  HERO_PERFORMANCE_RECOVERY_ENABLED,
  MOBILE_PORTRAIT_QUERY,
  REDUCED_MOTION_QUERY,
} from '../../config/performance'
import { useIsMobilePerformanceMode } from '../../hooks/useIsMobilePerformanceMode'
import { trackTelemetry } from '../../lib/telemetry'

const HERO_VIDEO_WEBM = '/media/hero/hero-mobile.9142e33d.webm'
const HERO_VIDEO_MP4 = '/media/hero/hero-mobile.eff86f8c.mp4'
const HERO_VIDEO_POSTER = '/media/hero/hero-mobile-poster.3379036e.jpg'

type HeroPlaybackState = 'idle' | 'attempting' | 'playing' | 'fallback'

const getMediaMatch = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia(query).matches

const getConnection = () =>
  (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean
        effectiveType?: string
      }
    }
  ).connection

const canLoadMobileVideo = () => {
  if (typeof navigator === 'undefined') return false
  const connection = getConnection()
  if (!connection) return true
  if (connection.saveData) return false
  return !['slow-2g', '2g', '3g'].includes(connection.effectiveType ?? '')
}

const isLikelyIOSSafari = () => {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent
  const isIOS = /iP(ad|hone|od)/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isWebKit = /WebKit/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent)

  return isIOS && isWebKit
}

export default function Hero() {
  const { t, lang } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const autoplayAttemptCountRef = useRef(0)
  const fallbackTelemetrySentRef = useRef(false)
  const playedTelemetrySentRef = useRef(false)
  const [isMobilePortrait, setIsMobilePortrait] = useState(() => getMediaMatch(MOBILE_PORTRAIT_QUERY))
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => getMediaMatch(REDUCED_MOTION_QUERY))
  const [canUseMobileVideo, setCanUseMobileVideo] = useState(() => canLoadMobileVideo())
  const [playbackState, setPlaybackState] = useState<HeroPlaybackState>('idle')
  const [preferMp4First, setPreferMp4First] = useState(() => isLikelyIOSSafari())

  const isMobilePerformanceMode = useIsMobilePerformanceMode()
  const shouldAnimateDesktop = !isMobilePerformanceMode && !prefersReducedMotion

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mobilePortrait = window.matchMedia(MOBILE_PORTRAIT_QUERY)
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)

    const syncMatches = () => {
      setIsMobilePortrait(mobilePortrait.matches)
      setPrefersReducedMotion(reducedMotion.matches)
      setCanUseMobileVideo(canLoadMobileVideo())
      setPreferMp4First(isLikelyIOSSafari())
    }

    syncMatches()

    if (typeof mobilePortrait.addEventListener === 'function') {
      mobilePortrait.addEventListener('change', syncMatches)
      reducedMotion.addEventListener('change', syncMatches)
      return () => {
        mobilePortrait.removeEventListener('change', syncMatches)
        reducedMotion.removeEventListener('change', syncMatches)
      }
    }

    mobilePortrait.addListener(syncMatches)
    reducedMotion.addListener(syncMatches)
    return () => {
      mobilePortrait.removeListener(syncMatches)
      reducedMotion.removeListener(syncMatches)
    }
  }, [])

  const shouldAttemptVideo =
    HERO_PERFORMANCE_RECOVERY_ENABLED &&
    isMobilePortrait &&
    !prefersReducedMotion &&
    canUseMobileVideo

  useEffect(() => {
    if (!isMobilePortrait) {
      setPlaybackState('idle')
      return
    }

    if (!shouldAttemptVideo) {
      setPlaybackState('fallback')
      return
    }

    setPlaybackState(prev => (prev === 'playing' ? prev : 'attempting'))
  }, [isMobilePortrait, shouldAttemptVideo])

  const sourceOrder = preferMp4First ? 'mp4-first' : 'webm-first'

  const moveToFallback = useCallback((reason: string) => {
    if (!fallbackTelemetrySentRef.current) {
      fallbackTelemetrySentRef.current = true
      trackTelemetry('hero_video_fallback', {
        reason,
        source_order: sourceOrder,
      })
    }
    setPlaybackState(prev => (prev === 'playing' || prev === 'fallback' ? prev : 'fallback'))
  }, [sourceOrder])

  useEffect(() => {
    if (playbackState !== 'attempting' || !videoRef.current || !shouldAttemptVideo) return

    autoplayAttemptCountRef.current = 0
    fallbackTelemetrySentRef.current = false
    playedTelemetrySentRef.current = false
    const heroVideo = videoRef.current
    const attemptDeadline = Date.now() + HERO_AUTOPLAY_ATTEMPT_WINDOW_MS
    let settled = false
    let hasTrackedAttempt = false

    const failToFallback = (reason: string) => {
      if (settled) return
      settled = true
      moveToFallback(reason)
    }

    const attemptPlayback = (reason: string) => {
      if (settled) return
      if (Date.now() > attemptDeadline) {
        failToFallback('attempt_window_expired')
        return
      }

      if (!hasTrackedAttempt) {
        hasTrackedAttempt = true
        trackTelemetry('hero_video_attempt', {
          reason,
          source_order: sourceOrder,
        })
      }

      autoplayAttemptCountRef.current += 1
      const playPromise = heroVideo.play()

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (Date.now() > attemptDeadline) {
            failToFallback('play_rejected')
          }
        })
      }
    }

    const handlePlay = () => {
      if (settled) return
      settled = true

      if (!playedTelemetrySentRef.current) {
        playedTelemetrySentRef.current = true
        trackTelemetry('hero_video_played', {
          attempts: autoplayAttemptCountRef.current,
          source_order: sourceOrder,
        })
      }

      setPlaybackState('playing')
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptPlayback('visibilitychange')
      }
    }
    const handleLoadedMetadata = () => {
      attemptPlayback('loadedmetadata')
    }
    const handleCanPlay = () => {
      attemptPlayback('canplay')
    }

    heroVideo.defaultMuted = true
    heroVideo.muted = true
    heroVideo.loop = true
    heroVideo.autoplay = true
    heroVideo.setAttribute('playsinline', '')
    heroVideo.setAttribute('webkit-playsinline', '')
    heroVideo.load()

    heroVideo.addEventListener('play', handlePlay)
    heroVideo.addEventListener('loadedmetadata', handleLoadedMetadata)
    heroVideo.addEventListener('canplay', handleCanPlay)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    attemptPlayback('initial')

    const retryIntervalId = window.setInterval(() => {
      attemptPlayback('retry_interval')
    }, HERO_AUTOPLAY_RETRY_INTERVAL_MS)

    const fallbackTimeoutId = window.setTimeout(() => {
      failToFallback('timeout')
    }, HERO_AUTOPLAY_ATTEMPT_WINDOW_MS)

    return () => {
      window.clearInterval(retryIntervalId)
      window.clearTimeout(fallbackTimeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      heroVideo.removeEventListener('play', handlePlay)
      heroVideo.removeEventListener('loadedmetadata', handleLoadedMetadata)
      heroVideo.removeEventListener('canplay', handleCanPlay)
    }
  }, [moveToFallback, playbackState, shouldAttemptVideo, sourceOrder])

  useEffect(() => {
    if (playbackState !== 'fallback' || !videoRef.current) return

    videoRef.current.pause()
  }, [playbackState])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const carX = useTransform(scrollYProgress, [0, 1], [0, 100])

  const isVideoPlaying = playbackState === 'playing'

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] flex flex-col overflow-hidden">
      {/* Background */}
      <motion.div style={shouldAnimateDesktop ? { scale } : undefined} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cc-black via-cc-black-800 to-cc-black" />
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-cc-red/[0.04] blur-[150px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-cc-red/[0.02] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-cc-red/[0.01] blur-[200px] rounded-full" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </motion.div>

      {/* Diagonal racing accent lines */}
      <div className="absolute top-0 right-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-cc-red/20 to-transparent transform rotate-[15deg] origin-top hidden lg:block" />
      <div className="absolute top-0 right-[16%] w-[1px] h-full bg-gradient-to-b from-transparent via-cc-red/8 to-transparent transform rotate-[15deg] origin-top hidden lg:block" />

      {/* Abstract car silhouette on right side - desktop only */}
      <motion.div
        style={shouldAnimateDesktop ? { x: carX } : undefined}
        className="absolute right-0 bottom-[15%] w-[55%] h-[40%] hidden lg:block pointer-events-none"
      >
        <motion.svg
          initial={shouldAnimateDesktop ? { opacity: 0, x: 80 } : undefined}
          animate={shouldAnimateDesktop ? { opacity: 0.04, x: 0 } : undefined}
          transition={shouldAnimateDesktop ? { duration: 1.5, delay: 1, ease: 'easeOut' } : undefined}
          viewBox="0 0 800 300"
          fill="none"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M50 230 Q80 230 120 225 L200 210 Q240 200 280 180 L350 150 Q380 135 420 125 L500 110 Q540 105 580 108 L650 115 Q690 120 720 135 L750 150 Q770 160 780 175 L785 200 Q785 220 770 230 L740 235 Q720 240 700 235 Q680 220 660 220 Q640 220 620 235 Q600 240 580 235 L280 235 Q260 240 240 235 Q220 220 200 220 Q180 220 160 235 Q140 240 120 235 L70 232 Q55 232 50 230 Z"
            fill="currentColor"
            className="text-cc-white"
          />
          <path
            d="M350 150 Q380 135 420 125 L500 110 Q530 105 550 108 L450 160 Q420 170 380 175 L350 150 Z"
            fill="currentColor"
            className="text-cc-red"
            opacity="0.3"
          />
        </motion.svg>
      </motion.div>

      {/* Horizontal speed lines */}
      {shouldAnimateDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 60 + i * 30, opacity: 0.03 + i * 0.01 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.8 }}
              className="h-[1px] bg-cc-red mb-6"
              style={{ marginRight: i * 20 }}
            />
          ))}
        </motion.div>
      )}

      {/* Mobile portrait video background band */}
      {isMobilePortrait && (
        <div className="pointer-events-none absolute inset-x-0 top-16 h-[clamp(220px,34vh,340px)] overflow-hidden md:hidden z-[2]">
          <img
            src={HERO_VIDEO_POSTER}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isVideoPlaying ? 'opacity-0' : 'opacity-100'}`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />

          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}
            poster={HERO_VIDEO_POSTER}
            muted
            loop
            playsInline
            autoPlay
            preload={shouldAttemptVideo ? 'metadata' : 'none'}
            aria-hidden="true"
            tabIndex={-1}
          >
            {shouldAttemptVideo && playbackState !== 'fallback' && (
              preferMp4First ? (
                <>
                  <source src={HERO_VIDEO_MP4} type="video/mp4" />
                  <source src={HERO_VIDEO_WEBM} type="video/webm" />
                </>
              ) : (
                <>
                  <source src={HERO_VIDEO_WEBM} type="video/webm" />
                  <source src={HERO_VIDEO_MP4} type="video/mp4" />
                </>
              )
            )}
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-cc-black/45 via-transparent to-cc-black/80" />
        </div>
      )}

      {/* Main content area - grows to fill space above stats */}
      <motion.div
        style={shouldAnimateDesktop ? { opacity, y } : undefined}
        className={`relative z-10 flex-1 flex items-start md:items-center max-w-7xl mx-auto w-full px-4 md:px-6 ${
          isMobilePortrait ? 'pt-[calc(4rem+clamp(220px,34vh,340px)+1.5rem)]' : 'pt-24'
        } md:pt-20 pb-10 md:pb-0`}
      >
        <div className="max-w-3xl w-full">
          {/* Tagline */}
          <motion.div
            initial={shouldAnimateDesktop ? { opacity: 0, x: lang === 'ar' ? 30 : -30 } : undefined}
            animate={shouldAnimateDesktop ? { opacity: 1, x: 0 } : undefined}
            transition={shouldAnimateDesktop ? { duration: 0.7, delay: 0.2 } : undefined}
            className="flex items-center gap-3 mb-5 md:mb-6"
          >
            <span className="block w-9 md:w-10 h-[2px] bg-cc-red" />
            <span className="text-cc-red text-xs tracking-[0.3em] uppercase font-medium">
              {t('hero.tagline')}
            </span>
          </motion.div>

          {/* Main title */}
          <motion.div
            initial={shouldAnimateDesktop ? { opacity: 0, y: 40 } : undefined}
            animate={shouldAnimateDesktop ? { opacity: 1, y: 0 } : undefined}
            transition={shouldAnimateDesktop ? { duration: 0.8, delay: 0.4 } : undefined}
          >
            <h1
              className="text-[3.6rem] leading-[0.88] sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-wider"
              style={lang === 'en' ? { fontFamily: "'Orbitron', sans-serif", fontWeight: 500 } : undefined}
            >
              <span className="text-[#BF281F] block">{t('hero.title1')}</span>
              <span className="text-white block mt-1">{t('hero.title2')}</span>
            </h1>
          </motion.div>

          {/* Red accent line below title */}
          <motion.div
            initial={shouldAnimateDesktop ? { width: 0 } : undefined}
            animate={shouldAnimateDesktop ? { width: 80 } : undefined}
            transition={shouldAnimateDesktop ? { duration: 0.8, delay: 0.8 } : undefined}
            className="h-[3px] bg-gradient-to-r from-cc-red to-transparent mt-5 md:mt-6"
          />

          {/* Subtitle */}
          <motion.p
            initial={shouldAnimateDesktop ? { opacity: 0, y: 30 } : undefined}
            animate={shouldAnimateDesktop ? { opacity: 1, y: 0 } : undefined}
            transition={shouldAnimateDesktop ? { duration: 0.7, delay: 0.7 } : undefined}
            className="hidden md:block mt-4 md:mt-5 text-cc-gray-300 text-[1.04rem] md:text-lg leading-relaxed max-w-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={shouldAnimateDesktop ? { opacity: 0, y: 30 } : undefined}
            animate={shouldAnimateDesktop ? { opacity: 1, y: 0 } : undefined}
            transition={shouldAnimateDesktop ? { duration: 0.7, delay: 0.9 } : undefined}
            className="flex flex-wrap items-center gap-3 md:gap-4 mt-6 md:mt-8"
          >
            <Link to="/inventory">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={16} />}
                iconPosition={lang === 'ar' ? 'left' : 'right'}
              >
                {t('hero.cta')}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats strip - pinned to bottom, separate from content flow */}
      <motion.div
        initial={shouldAnimateDesktop ? { opacity: 0, y: 30 } : undefined}
        animate={shouldAnimateDesktop ? { opacity: 1, y: 0 } : undefined}
        transition={shouldAnimateDesktop ? { duration: 0.7, delay: 1.2 } : undefined}
        className="relative z-10 hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-8 lg:gap-12 py-6 border-t border-white/[0.06]">
            <Stat number="30+" label={t('home.yearsInBusiness')} />
            <Stat number="5,000+" label={t('home.carsDelivered')} />
            <Stat number="4,200+" label={t('home.happyClients')} />
            <Stat number="2" label={t('home.branches')} />
          </div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cc-black to-transparent pointer-events-none z-[5]" />

      {/* Scroll indicator */}
      {shouldAnimateDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} className="text-cc-gray-400" />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-display text-xl lg:text-2xl text-cc-red tracking-wider">{number}</span>
      <span className="text-cc-gray-400 text-[0.65rem] lg:text-xs tracking-wider uppercase">{label}</span>
    </div>
  )
}
