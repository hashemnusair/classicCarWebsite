import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, Phone, Mail, MapPin, CheckCircle } from 'lucide-react'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'
import { siteConfig } from '../data/branches'
import { useLanguage } from '../context/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const carOfInterest = searchParams.get('car') || ''

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    preferredContact: 'whatsapp',
    message: '',
    carOfInterest,
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Simulate form submission
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
    }, 1500)
  }

  const inputClass = 'w-full bg-cc-black-700 border border-cc-black-500 rounded-lg px-4 py-3 text-sm text-cc-white placeholder:text-cc-gray-400 focus:outline-none focus:border-cc-red/40 transition-colors'

  const contactMethods = [
    {
      icon: MessageCircle,
      label: t('contact.whatsapp'),
      value: siteConfig.whatsapp,
      href: `https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`,
      color: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20',
    },
    {
      icon: Phone,
      label: t('contact.call'),
      value: siteConfig.phone,
      href: `tel:${siteConfig.phone}`,
      color: 'bg-cc-red/10 text-cc-red-light border-cc-red/20',
    },
    {
      icon: Mail,
      label: t('contact.emailUs'),
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      icon: MapPin,
      label: t('contact.visitUs'),
      value: 'Amman, Jordan',
      href: '#',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  ]

  return (
    <div className="pt-24 md:pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
        />

        {/* Contact Methods */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {contactMethods.map((method, i) => {
            const Icon = method.icon
            return (
              <motion.a
                key={i}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl glass-card text-center`}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg border ${method.color}`}>
                  <Icon size={20} />
                </div>
                <span className="font-display text-xs tracking-wider text-cc-white">
                  {method.label}
                </span>
                <span className="text-cc-gray-400 text-xs" dir="ltr">
                  {method.value}
                </span>
              </motion.a>
            )
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-6 md:p-10"
          >
            <h3 className="font-display text-sm tracking-[0.2em] uppercase text-cc-white mb-8 flex items-center gap-3">
              <span className="w-6 h-[2px] bg-cc-red" />
              {t('contact.form')}
            </h3>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 mx-auto mb-6">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="font-display text-xl tracking-wider text-cc-white mb-3">
                    {t('contact.thankYou')}
                  </h3>
                  <p className="text-cc-gray-300 text-sm mb-8">
                    {t('contact.thankYouMessage')}
                  </p>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="primary"
                      icon={<MessageCircle size={16} />}
                      className="bg-[#25D366] hover:bg-[#20BD5A] shadow-[#25D366]/20"
                    >
                      {t('contact.openWhatsApp')}
                    </Button>
                  </a>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-cc-gray-300 text-xs tracking-wider uppercase mb-2">
                        {t('contact.name')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('contact.namePlaceholder')}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-cc-gray-300 text-xs tracking-wider uppercase mb-2">
                        {t('contact.phone')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t('contact.phonePlaceholder')}
                        className={inputClass}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-cc-gray-300 text-xs tracking-wider uppercase mb-2">
                      {t('contact.email')}
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t('contact.emailPlaceholder')}
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-cc-gray-300 text-xs tracking-wider uppercase mb-2">
                      {t('contact.preferredContact')}
                    </label>
                    <div className="flex gap-3">
                      {['whatsapp', 'call', 'email'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, preferredContact: method }))}
                          className={`px-4 py-2 rounded-lg text-xs tracking-wider capitalize transition-all cursor-pointer ${
                            form.preferredContact === method
                              ? 'bg-cc-red/15 text-cc-red-light border border-cc-red/30'
                              : 'bg-cc-black-700 text-cc-gray-300 border border-cc-black-500 hover:border-cc-gray-400'
                          }`}
                        >
                          {method === 'call' ? t('contact.call') : method === 'email' ? t('contact.emailUs') : t('contact.whatsapp')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {carOfInterest && (
                    <div>
                      <label className="block text-cc-gray-300 text-xs tracking-wider uppercase mb-2">
                        {t('contact.carOfInterest')}
                      </label>
                      <input
                        type="text"
                        value={form.carOfInterest}
                        onChange={e => setForm(prev => ({ ...prev, carOfInterest: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-cc-gray-300 text-xs tracking-wider uppercase mb-2">
                      {t('contact.message')} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t('contact.messagePlaceholder')}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<Send size={16} />}
                    className="w-full"
                    disabled={sending}
                  >
                    {sending ? t('contact.sending') : t('contact.submit')}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
