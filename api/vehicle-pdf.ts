import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import QRCode from 'qrcode'
import { getBranchForVehicle, siteConfig } from '../src/data/branches'
import { getVehicleBySlug } from '../src/data/vehicles'
import { t } from '../src/i18n'
import type { Language, Vehicle, VehicleImage } from '../src/types'

type PdfLang = Extract<Language, 'en' | 'ar'>
type QueryValue = string | string[] | undefined

const PDF_IMAGE_PLACEHOLDER = 'linear-gradient(135deg, #111111 0%, #1d1d1d 45%, #111111 100%)'

interface RequestLike {
  method?: string
  query: Record<string, QueryValue>
  headers: Record<string, string | string[] | undefined>
}

interface ResponseLike {
  status: (code: number) => ResponseLike
  json: (payload: { error: string }) => ResponseLike
  setHeader: (name: string, value: string) => void
  send: (payload: Buffer) => ResponseLike
}

function getQueryValue(input: QueryValue): string {
  if (Array.isArray(input)) return input[0] ?? ''
  return input ?? ''
}

function isPdfLang(value: string): value is PdfLang {
  return value === 'en' || value === 'ar'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;')
}

function isGradientImage(value: string): boolean {
  return /\bgradient\(/i.test(value)
}

function formatNumber(value: number, lang: PdfLang): string {
  return value.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US')
}

function getOriginFromRequest(req: RequestLike): string {
  const protoHeader = req.headers['x-forwarded-proto']
  const hostHeader = req.headers['x-forwarded-host'] ?? req.headers.host
  const protocolRaw = Array.isArray(protoHeader) ? protoHeader[0] : (protoHeader ?? 'https')
  const protocol = protocolRaw.split(',')[0]
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader

  if (!host) return 'http://localhost:5173'
  return `${protocol}://${host}`
}

function getVehicleTitle(vehicle: Vehicle): string {
  const base = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  return vehicle.trim ? `${base} ${vehicle.trim}` : base
}

function getVehicleDescription(vehicle: Vehicle, lang: PdfLang): string {
  return lang === 'ar' ? vehicle.descriptionAr : vehicle.descriptionEn
}

function getVehicleFeatures(vehicle: Vehicle, lang: PdfLang): string[] {
  return lang === 'ar' ? vehicle.featuresAr : vehicle.featuresEn
}

function getVehiclePrice(vehicle: Vehicle, lang: PdfLang): string {
  if (vehicle.priceMode === 'show' && vehicle.price != null) {
    return `${formatNumber(vehicle.price, lang)} JOD`
  }
  return t(lang, 'inventory.priceOnRequest')
}

function sortVehicleImages(images: VehicleImage[]): VehicleImage[] {
  if (images.length === 0) {
    return [{ url: PDF_IMAGE_PLACEHOLDER, alt: 'Vehicle image', order: 0 }]
  }
  return [...images].sort((a, b) => a.order - b.order)
}

function renderImage(image: VehicleImage, title: string, className: string): string {
  if (isGradientImage(image.url)) {
    return `
      <div class="${className} gradient-image" style="background:${escapeAttribute(image.url)};">
        <div class="gradient-image-shine"></div>
      </div>
    `
  }

  return `
    <img
      class="${className}"
      src="${escapeAttribute(image.url)}"
      alt="${escapeAttribute(image.alt || title)}"
    />
  `
}

function getStatusClass(status: Vehicle['status']): string {
  if (status === 'available') return 'status-available'
  if (status === 'reserved') return 'status-reserved'
  return 'status-sold'
}

function buildPdfHtml(vehicle: Vehicle, lang: PdfLang, origin: string, qrDataUrl: string): string {
  const title = getVehicleTitle(vehicle)
  const description = getVehicleDescription(vehicle, lang)
  const features = getVehicleFeatures(vehicle, lang)
  const orderedImages = sortVehicleImages(vehicle.images)
  const heroImage = orderedImages[0]
  const galleryImages = orderedImages.slice(1, 4)
  while (galleryImages.length < 3) {
    galleryImages.push({
      url: PDF_IMAGE_PLACEHOLDER,
      alt: title,
      order: 100 + galleryImages.length,
    })
  }

  const branch = getBranchForVehicle(vehicle.branchId)
  const branchName = lang === 'ar' ? branch.nameAr : branch.nameEn
  const branchAddress = lang === 'ar' ? branch.addressAr : branch.addressEn
  const scanLabel = lang === 'ar' ? 'امسح للفتح' : 'Scan to open'
  const logoUrl = `${origin}/logo.jpg`
  const statusLabel = t(lang, `vehicle.${vehicle.status}`)
  const priceLabel = getVehiclePrice(vehicle, lang)
  const direction = lang === 'ar' ? 'rtl' : 'ltr'
  const generatedDate = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  const originLabel = vehicle.origin === 'local'
    ? t(lang, 'vehicle.local')
    : `${t(lang, 'vehicle.imported')}${vehicle.importCountry ? ` - ${vehicle.importCountry}` : ''}`

  const specs = [
    { label: t(lang, 'vehicle.year'), value: String(vehicle.year) },
    { label: t(lang, 'vehicle.mileage'), value: `${formatNumber(vehicle.mileage, lang)} ${t(lang, 'vehicle.km')}` },
    { label: t(lang, 'vehicle.engine'), value: vehicle.engine },
    { label: t(lang, 'vehicle.transmission'), value: t(lang, `transmissions.${vehicle.transmission}`) },
    { label: t(lang, 'vehicle.drivetrain'), value: vehicle.drivetrain.toUpperCase() },
    { label: t(lang, 'vehicle.fuelType'), value: t(lang, `fuelTypes.${vehicle.fuelType}`) },
    { label: t(lang, 'vehicle.exteriorColor'), value: vehicle.exteriorColor },
    { label: t(lang, 'vehicle.interiorColor'), value: vehicle.interiorColor },
    { label: t(lang, 'vehicle.bodyType'), value: t(lang, `bodyTypes.${vehicle.bodyType}`) },
    { label: t(lang, 'vehicle.origin'), value: originLabel },
  ]
  const quickSpecs = specs.slice(0, 6)

  return `
<!doctype html>
<html lang="${lang}" dir="${direction}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} - Classic Car</title>
    <style>
      @font-face {
        font-family: 'PDFDisplay';
        src: url('${origin}/fonts/michroma-latin-400.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'PDFBody';
        src: url('${origin}/fonts/outfit-latin-400-700.woff2') format('woff2');
        font-weight: 400 700;
        font-style: normal;
      }
      @font-face {
        font-family: 'PDFArabic';
        src: url('${origin}/fonts/tajawal-arabic-400.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'PDFArabic';
        src: url('${origin}/fonts/tajawal-arabic-700.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
      }

      :root {
        --cc-black: #050505;
        --cc-black-soft: #141414;
        --cc-red: #c8102e;
        --cc-red-soft: #f5dde2;
        --cc-gray-100: #f6f6f6;
        --cc-gray-200: #ececec;
        --cc-gray-400: #7a7a7a;
        --cc-gray-600: #4d4d4d;
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: ${lang === 'ar' ? "'PDFArabic', 'Tahoma', sans-serif" : "'PDFBody', 'Arial', sans-serif"};
        color: var(--cc-black);
        background: #fff;
      }

      @page {
        size: A4;
        margin: 0;
      }

      .page {
        position: relative;
        width: 210mm;
        min-height: 297mm;
        padding: 12mm 12mm 11mm;
        overflow: hidden;
      }

      .page + .page {
        page-break-before: always;
      }

      .page::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 95% 0%, rgba(200,16,46,0.08), rgba(255,255,255,0) 35%),
          linear-gradient(180deg, rgba(5,5,5,0.015), rgba(255,255,255,0));
        pointer-events: none;
      }

      .header {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8mm;
      }

      .logo {
        width: 38mm;
        height: auto;
      }

      .showroom-block {
        text-align: ${direction === 'rtl' ? 'left' : 'right'};
      }

      .kicker {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: var(--cc-gray-400);
      }

      .showroom-name {
        margin-top: 3px;
        font-size: 11px;
        font-weight: 700;
      }

      .hero {
        position: relative;
        height: 92mm;
        border-radius: 7mm;
        overflow: hidden;
        border: 1px solid var(--cc-gray-200);
        background: #121212;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .gradient-image {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .gradient-image-shine {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 22% 18%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%);
      }

      .hero::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.04) 20%, rgba(0,0,0,0.58) 100%);
      }

      .identity {
        position: relative;
        margin-top: 6mm;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 4mm;
      }

      .chip {
        border-radius: 999px;
        border: 1px solid var(--cc-gray-200);
        padding: 4px 9px;
        font-size: 8px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cc-gray-600);
      }

      .chip.status-available {
        background: #eaf9ef;
        border-color: #caecd6;
        color: #15703a;
      }

      .chip.status-reserved {
        background: #fff5e8;
        border-color: #f2dab4;
        color: #a45a00;
      }

      .chip.status-sold {
        background: #f4f4f4;
        border-color: #dedede;
        color: #707070;
      }

      h1 {
        margin: 0;
        font-family: 'PDFDisplay', 'PDFBody', sans-serif;
        font-size: 23px;
        line-height: 1.22;
        letter-spacing: 0.04em;
      }

      .price {
        margin-top: 4mm;
        font-size: 16px;
        font-weight: 700;
        color: var(--cc-red);
      }

      .description {
        margin-top: 4.6mm;
        border-radius: 4mm;
        background: var(--cc-gray-100);
        border: 1px solid var(--cc-gray-200);
        padding: 4mm;
      }

      .description h2 {
        margin: 0 0 2.2mm;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--cc-gray-600);
      }

      .description p {
        margin: 0;
        font-size: 11px;
        line-height: 1.55;
        color: #222;
      }

      .quick-specs {
        margin-top: 4mm;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 2.6mm;
      }

      .spec-card {
        border: 1px solid var(--cc-gray-200);
        border-radius: 3mm;
        padding: 2.6mm 2.8mm;
        background: #fff;
      }

      .spec-label {
        margin: 0;
        font-size: 7.2px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--cc-gray-400);
      }

      .spec-value {
        margin: 1.5mm 0 0;
        font-size: 10.3px;
        font-weight: 600;
        color: #141414;
      }

      .page-two-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4mm;
      }

      .block {
        border: 1px solid var(--cc-gray-200);
        border-radius: 4mm;
        padding: 3.5mm;
        background: #fff;
      }

      .block-title {
        margin: 0 0 3mm;
        font-size: 8.5px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: var(--cc-gray-600);
      }

      .specs-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2.5mm;
      }

      .spec-row p { margin: 0; }
      .spec-row .spec-label { font-size: 7px; }
      .spec-row .spec-value { font-size: 9px; line-height: 1.35; margin-top: 1mm; }

      .feature-list {
        margin: 0;
        padding: 0;
        list-style: none;
        columns: 2;
        column-gap: 3mm;
      }

      .feature-list li {
        break-inside: avoid;
        font-size: 8.6px;
        color: #1f1f1f;
        margin: 0 0 1.8mm;
        padding-${direction === 'rtl' ? 'right' : 'left'}: 3mm;
        position: relative;
        line-height: 1.4;
      }

      .feature-list li::before {
        content: '';
        position: absolute;
        ${direction === 'rtl' ? 'right' : 'left'}: 0;
        top: 0.58em;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--cc-red);
      }

      .gallery {
        margin-top: 4mm;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 2.2mm;
      }

      .gallery-item {
        height: 36mm;
        border-radius: 3mm;
        overflow: hidden;
        border: 1px solid var(--cc-gray-200);
        background: #141414;
      }

      .gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .contact-strip {
        margin-top: 4mm;
        border: 1px solid var(--cc-gray-200);
        border-radius: 4mm;
        background: linear-gradient(140deg, #ffffff, #f7f7f7);
        padding: 3.4mm;
        display: grid;
        grid-template-columns: 1.7fr 1fr;
        gap: 4mm;
        align-items: center;
      }

      .contact-lines {
        display: flex;
        flex-direction: column;
        gap: 1.5mm;
      }

      .contact-line {
        margin: 0;
        font-size: 9px;
        color: #1a1a1a;
      }

      .contact-line strong {
        color: var(--cc-red);
        margin-${direction === 'rtl' ? 'left' : 'right'}: 4px;
      }

      .qr-wrap {
        border: 1px solid #e3e3e3;
        border-radius: 3mm;
        background: #fff;
        padding: 2mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.2mm;
      }

      .qr-wrap img {
        width: 27mm;
        height: 27mm;
      }

      .qr-caption {
        font-size: 7px;
        color: var(--cc-gray-600);
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .footer {
        margin-top: 3mm;
        padding-top: 2.6mm;
        border-top: 1px solid #ececec;
        display: flex;
        justify-content: space-between;
        gap: 3mm;
      }

      .footer p {
        margin: 0;
        font-size: 7.5px;
        color: var(--cc-gray-400);
        line-height: 1.45;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="page">
        <header class="header">
          <img class="logo" src="${escapeAttribute(logoUrl)}" alt="Classic Car" />
          <div class="showroom-block">
            <p class="kicker">${escapeHtml(t(lang, 'vehicle.showroom'))}</p>
            <p class="showroom-name">${escapeHtml(branchName)}</p>
          </div>
        </header>

        <div class="hero">
          ${renderImage(heroImage, title, 'hero-image')}
        </div>

        <section class="identity">
          <div class="chips">
            <span class="chip ${getStatusClass(vehicle.status)}">${escapeHtml(statusLabel)}</span>
            ${vehicle.tags.slice(0, 5).map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join('')}
          </div>
          <h1>${escapeHtml(title)}</h1>
          <p class="price">${escapeHtml(priceLabel)}</p>
        </section>

        <section class="description">
          <h2>${escapeHtml(t(lang, 'vehicle.description'))}</h2>
          <p>${escapeHtml(description)}</p>
        </section>

        <section class="quick-specs">
          ${quickSpecs.map(spec => `
            <article class="spec-card">
              <p class="spec-label">${escapeHtml(spec.label)}</p>
              <p class="spec-value">${escapeHtml(spec.value)}</p>
            </article>
          `).join('')}
        </section>
      </section>

      <section class="page">
        <div class="page-two-grid">
          <section class="block">
            <h2 class="block-title">${escapeHtml(t(lang, 'vehicle.specs'))}</h2>
            <div class="specs-list">
              ${specs.map(spec => `
                <div class="spec-row">
                  <p class="spec-label">${escapeHtml(spec.label)}</p>
                  <p class="spec-value">${escapeHtml(spec.value)}</p>
                </div>
              `).join('')}
            </div>
          </section>

          <section class="block">
            <h2 class="block-title">${escapeHtml(t(lang, 'vehicle.features'))}</h2>
            <ul class="feature-list">
              ${features.slice(0, 16).map(feature => `<li>${escapeHtml(feature)}</li>`).join('')}
            </ul>
          </section>
        </div>

        <section class="gallery">
          ${galleryImages.map((image, index) => `
            <div class="gallery-item">
              ${renderImage(image, `${title} ${index + 2}`, '')}
            </div>
          `).join('')}
        </section>

        <section class="contact-strip">
          <div class="contact-lines">
            <p class="contact-line"><strong>${escapeHtml(t(lang, 'vehicle.showroom'))}:</strong> ${escapeHtml(branchName)}</p>
            <p class="contact-line">${escapeHtml(branchAddress)}</p>
            <p class="contact-line"><strong>${escapeHtml(t(lang, 'common.call'))}:</strong> ${escapeHtml(branch.phone)}</p>
            <p class="contact-line"><strong>${escapeHtml(t(lang, 'common.whatsapp'))}:</strong> ${escapeHtml(branch.whatsapp)}</p>
            <p class="contact-line"><strong>Email:</strong> ${escapeHtml(siteConfig.email)}</p>
          </div>
          <div class="qr-wrap">
            <img src="${escapeAttribute(qrDataUrl)}" alt="Vehicle QR" />
            <p class="qr-caption">${escapeHtml(scanLabel)}</p>
          </div>
        </section>

        <footer class="footer">
          <p>${escapeHtml(t(lang, 'vehicle.generatedOn'))}: ${escapeHtml(generatedDate)}</p>
          <p>${escapeHtml(t(lang, 'vehicle.pdfDisclaimer'))}</p>
        </footer>
      </section>
    </main>
  </body>
</html>
  `
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const slug = getQueryValue(req.query.slug).trim()
  const requestedLang = getQueryValue(req.query.lang).trim().toLowerCase()

  if (!slug || !isPdfLang(requestedLang)) {
    return res.status(400).json({ error: 'Invalid request. Expected slug and lang=en|ar.' })
  }

  const vehicle = getVehicleBySlug(slug)
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' })
  }

  const origin = getOriginFromRequest(req)

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

  try {
    const vehicleUrl = `${origin}/inventory/${vehicle.slug}`
    const qrDataUrl = await QRCode.toDataURL(vehicleUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: '#050505',
        light: '#FFFFFFFF',
      },
    })

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    const html = buildPdfHtml(vehicle, requestedLang, origin, qrDataUrl)
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.evaluate(() => document.fonts.ready)

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    })

    await page.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${vehicle.slug}-${requestedLang}.pdf"`)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(Buffer.from(pdfBuffer))
  } catch (error) {
    console.error('vehicle-pdf error', error)
    return res.status(500).json({ error: 'Failed to generate PDF.' })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
