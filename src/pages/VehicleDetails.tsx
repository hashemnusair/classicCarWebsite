import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, MessageCircle, Phone, CalendarCheck, Share2, Copy, Check, Download, Loader2, MapPin } from 'lucide-react'
import { useState } from 'react'
import Gallery from '../components/vehicle/Gallery'
import SpecsPanel from '../components/vehicle/SpecsPanel'
import SimilarCars from '../components/vehicle/SimilarCars'
import Button from '../components/ui/Button'
import { getVehicleBySlug } from '../data/vehicles'
import { getBranchForVehicle } from '../data/branches'
import { useLanguage } from '../context/LanguageContext'
import { canNativeShareFile, downloadBlob, getVehiclePdf, shareFile } from '../lib/pdf'
import { trackTelemetry } from '../lib/telemetry'

export default function VehicleDetails() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [pdfMode, setPdfMode] = useState<'download' | 'share' | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const vehicle = slug ? getVehicleBySlug(slug) : undefined

  if (!vehicle) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-display text-2xl text-cc-white mb-4">Vehicle Not Found</h1>
          <Link to="/inventory" className="text-cc-red-light hover:text-cc-red text-sm">
            {t('common.backToInventory')}
          </Link>
        </div>
      </div>
    )
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const fullTitle = vehicle.trim ? `${title} ${vehicle.trim}` : title
  const description = lang === 'ar' ? vehicle.descriptionAr : vehicle.descriptionEn
  const features = lang === 'ar' ? vehicle.featuresAr : vehicle.featuresEn
  const branch = getBranchForVehicle(vehicle.branchId)
  const branchName = lang === 'ar' ? branch.nameAr : branch.nameEn
  const branchAddress = lang === 'ar' ? branch.addressAr : branch.addressEn
  const telemetryBasePayload = {
    slug: vehicle.slug,
    lang,
    status: vehicle.status,
    branchId: vehicle.branchId ?? branch.id,
  }

  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in the ${fullTitle}. ${window.location.href}`)
  const whatsappUrl = `https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`
  const isPdfBusy = pdfMode !== null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const requestVehiclePdf = async (action: 'download' | 'share') => {
    setPdfMode(action)
    setPdfError(null)
    trackTelemetry('vehicle_pdf_generate_click', {
      ...telemetryBasePayload,
      action,
    })

    try {
      const result = await getVehiclePdf({ slug: vehicle.slug, lang })
      trackTelemetry('vehicle_pdf_generate_success', {
        ...telemetryBasePayload,
        action,
      })
      return result
    } catch (error) {
      trackTelemetry('vehicle_pdf_generate_error', {
        ...telemetryBasePayload,
        action,
        message: error instanceof Error ? error.message : 'unknown_error',
      })
      setPdfError(t('vehicle.pdfError'))
      throw error
    } finally {
      setPdfMode(null)
    }
  }

  const handleGeneratePdf = async () => {
    if (isPdfBusy) return
    try {
      const { blob, filename } = await requestVehiclePdf('download')
      downloadBlob(blob, filename)
      setShowShare(false)
    } catch {
      // Error state is handled above.
    }
  }

  const handleSharePdf = async () => {
    if (isPdfBusy) return

    try {
      const { blob, filename } = await requestVehiclePdf('share')
      const file = new File([blob], filename, { type: 'application/pdf' })

      if (canNativeShareFile(file)) {
        try {
          await shareFile(file, fullTitle, `${fullTitle} - Classic Car`)
          trackTelemetry('vehicle_pdf_share_native', telemetryBasePayload)
          setShowShare(false)
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return
          }
          setPdfError(t('vehicle.pdfError'))
          return
        }
      }

      downloadBlob(blob, filename)
      setShowShare(false)
    } catch {
      // Error state is handled above.
    }
  }

  const trackBranchCtaClick = (action: 'whatsapp' | 'call' | 'book_viewing') => {
    trackTelemetry('vehicle_branch_cta_click', {
      ...telemetryBasePayload,
      action,
    })
  }

  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-cc-gray-300 hover:text-cc-white text-sm transition-colors cursor-pointer"
          >
            {lang === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {t('common.backToInventory')}
          </button>
        </motion.div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Gallery
            images={vehicle.images}
            title={fullTitle}
            gradient={vehicle.images[0]?.url}
          />
        </motion.div>

        {/* Title + Status + Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 mb-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-3">
                {/* Status */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider rounded-sm ${
                  vehicle.status === 'available'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : vehicle.status === 'reserved'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'bg-cc-gray-400/15 text-cc-gray-300 border border-cc-gray-400/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    vehicle.status === 'available' ? 'bg-emerald-400 pulse-dot' :
                    vehicle.status === 'reserved' ? 'bg-amber-400 pulse-dot' : 'bg-cc-gray-300'
                  }`} />
                  {t(`vehicle.${vehicle.status}`)}
                </span>
                {/* Showroom */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider rounded-sm bg-cc-black-700 border border-cc-black-500 text-cc-gray-200">
                  <MapPin size={12} className="text-cc-red" />
                  {t('vehicle.showroom')}: {branchName}
                </span>
                {/* Tags */}
                {vehicle.tags.map(tag => (
                  <span key={tag} className="car-tag">{tag}</span>
                ))}
              </div>

              <h1 className="font-display text-2xl md:text-4xl tracking-wider text-cc-white">
                {fullTitle}
              </h1>

              {/* Price */}
              <div className="mt-3">
                {vehicle.priceMode === 'show' && vehicle.price ? (
                  <span className="text-cc-red text-2xl font-bold">
                    {vehicle.price.toLocaleString()} JOD
                  </span>
                ) : (
                  <span className="text-cc-gray-300 text-sm tracking-wider uppercase">
                    {t('inventory.priceOnRequest')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={isPdfBusy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  onClick={handleGeneratePdf}
                  disabled={isPdfBusy}
                >
                  {pdfMode === 'download' ? t('vehicle.generatingPdf') : t('vehicle.generatePdf')}
                </Button>

                {/* Share button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Share2 size={16} />}
                    onClick={() => setShowShare(!showShare)}
                  >
                    {t('vehicle.share')}
                  </Button>

                  {showShare && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 bg-cc-black-700 border border-cc-black-500 rounded-lg p-2 shadow-xl z-20 min-w-[210px]"
                    >
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-cc-gray-200 hover:text-cc-white hover:bg-cc-black-600 rounded transition-colors cursor-pointer"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        {copied ? t('vehicle.linkCopied') : t('vehicle.copyLink')}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(fullTitle + ' ' + window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-cc-gray-200 hover:text-cc-white hover:bg-cc-black-600 rounded transition-colors"
                      >
                        <MessageCircle size={14} />
                        {t('vehicle.shareWhatsApp')}
                      </a>
                      <button
                        onClick={handleSharePdf}
                        disabled={isPdfBusy}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-cc-gray-200 hover:text-cc-white hover:bg-cc-black-600 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pdfMode === 'share'
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Share2 size={14} />}
                        {pdfMode === 'share' ? t('vehicle.generatingPdf') : t('vehicle.sharePdf')}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {pdfError && (
                <p className="text-xs text-rose-300 text-right max-w-[320px]">
                  {pdfError}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Specs + Description + Features */}
          <div className="lg:col-span-2 space-y-8">
            <SpecsPanel vehicle={vehicle} />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-6 md:p-8"
            >
              <h3 className="font-display text-sm tracking-[0.2em] uppercase text-cc-white mb-4 flex items-center gap-3">
                <span className="w-6 h-[2px] bg-cc-red" />
                {t('vehicle.description')}
              </h3>
              <p className="text-cc-gray-300 text-sm leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* Features */}
            {features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-xl p-6 md:p-8"
              >
                <h3 className="font-display text-sm tracking-[0.2em] uppercase text-cc-white mb-6 flex items-center gap-3">
                  <span className="w-6 h-[2px] bg-cc-red" />
                  {t('vehicle.features')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-cc-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-cc-red shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: CTAs (sticky on desktop) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-4"
            >
              <div className="glass-card rounded-xl p-5">
                <p className="text-cc-gray-400 text-[0.68rem] tracking-[0.16em] uppercase mb-2">
                  {t('vehicle.showroom')}
                </p>
                <p className="text-cc-white text-sm font-medium mb-2">{branchName}</p>
                <p className="text-cc-gray-300 text-xs leading-relaxed">{branchAddress}</p>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                onClick={() => trackBranchCtaClick('whatsapp')}
              >
                <Button
                  variant="primary"
                  size="lg"
                  icon={<MessageCircle size={18} />}
                  className="w-full bg-[#25D366] hover:bg-[#20BD5A] shadow-[#25D366]/20 hover:shadow-[#25D366]/30"
                >
                  {t('vehicle.askAbout')}
                </Button>
              </a>

              {/* Call */}
              <a href={`tel:${branch.phone}`} className="block" onClick={() => trackBranchCtaClick('call')}>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Phone size={18} />}
                  className="w-full"
                >
                  {t('vehicle.callUs')}
                </Button>
              </a>

              {/* Book Viewing */}
              <Link
                to={`/contact?car=${encodeURIComponent(fullTitle)}&branch=${encodeURIComponent(branch.id)}`}
                className="block"
                onClick={() => trackBranchCtaClick('book_viewing')}
              >
                <Button
                  variant="outline"
                  size="lg"
                  icon={<CalendarCheck size={18} />}
                  className="w-full"
                >
                  {t('vehicle.bookViewing')}
                </Button>
              </Link>

              {/* Price note */}
              {vehicle.priceMode === 'hide' && (
                <div className="glass-card rounded-xl p-5 text-center">
                  <p className="text-cc-gray-400 text-xs tracking-wider uppercase mb-1">
                    {t('inventory.priceOnRequest')}
                  </p>
                  <p className="text-cc-gray-300 text-xs">
                    {lang === 'ar'
                      ? 'تواصل معنا عبر واتساب أو الهاتف للحصول على السعر'
                      : 'Contact us via WhatsApp or phone for pricing'}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Similar Cars */}
        <SimilarCars vehicle={vehicle} />
      </div>
    </div>
  )
}
