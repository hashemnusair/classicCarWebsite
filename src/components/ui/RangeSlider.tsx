import { useRef, useCallback, useState, useEffect } from 'react'

interface RangeSliderProps {
  label: string
  unit?: string
  min: number
  max: number
  valueMin: number | null
  valueMax: number | null
  onChange: (min: number | null, max: number | null) => void
  step?: number
  formatValue?: (v: number) => string
}

export default function RangeSlider({
  label,
  unit,
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step = 1,
  formatValue = String,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)

  // Always-visible input state
  const [minFocused, setMinFocused] = useState(false)
  const [maxFocused, setMaxFocused] = useState(false)
  const [minText, setMinText] = useState('')
  const [maxText, setMaxText] = useState('')

  const currentMin = valueMin ?? min
  const currentMax = valueMax ?? max

  const range = max - min || 1
  const leftPct = ((currentMin - min) / range) * 100
  const rightPct = ((currentMax - min) / range) * 100

  const snap = useCallback(
    (raw: number) => {
      const clamped = Math.max(min, Math.min(max, raw))
      return Math.round(clamped / step) * step
    },
    [min, max, step]
  )

  const pctToValue = useCallback(
    (clientX: number) => {
      const rect = trackRef.current!.getBoundingClientRect()
      const isRtl = getComputedStyle(trackRef.current!).direction === 'rtl'
      let pct = (clientX - rect.left) / rect.width
      if (isRtl) pct = 1 - pct
      return snap(min + pct * range)
    },
    [min, range, snap]
  )

  const handlePointerDown = useCallback(
    (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      setDragging(thumb)
    },
    []
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      const val = pctToValue(e.clientX)
      if (dragging === 'min') {
        const capped = Math.min(val, currentMax)
        onChange(capped === min ? null : capped, valueMax)
      } else {
        const capped = Math.max(val, currentMin)
        onChange(valueMin, capped === max ? null : capped)
      }
    },
    [dragging, pctToValue, currentMin, currentMax, min, max, valueMin, valueMax, onChange]
  )

  const handlePointerUp = useCallback(() => {
    setDragging(null)
  }, [])

  const handleTrackClick = useCallback(
    (e: React.PointerEvent) => {
      if (dragging) return
      const val = pctToValue(e.clientX)
      const distToMin = Math.abs(val - currentMin)
      const distToMax = Math.abs(val - currentMax)
      if (distToMin <= distToMax) {
        const capped = Math.min(val, currentMax)
        onChange(capped === min ? null : capped, valueMax)
      } else {
        const capped = Math.max(val, currentMin)
        onChange(valueMin, capped === max ? null : capped)
      }
    },
    [dragging, pctToValue, currentMin, currentMax, min, max, valueMin, valueMax, onChange]
  )

  useEffect(() => {
    if (dragging) {
      const prevent = (e: Event) => e.preventDefault()
      document.addEventListener('selectstart', prevent)
      return () => document.removeEventListener('selectstart', prevent)
    }
  }, [dragging])

  const parseInputNumber = useCallback(
    (text: string) => Number.parseFloat(text.replace(/,/g, '').trim()),
    []
  )

  function commitMin() {
    const raw = parseInputNumber(minText)
    if (!isNaN(raw)) {
      const snapped = snap(raw)
      const capped = Math.min(snapped, currentMax)
      onChange(capped === min ? null : capped, valueMax)
    }
  }

  function commitMax() {
    const raw = parseInputNumber(maxText)
    if (!isNaN(raw)) {
      const snapped = snap(raw)
      const capped = Math.max(snapped, currentMin)
      onChange(valueMin, capped === max ? null : capped)
    }
  }

  if (min === max) return null

  const ariaLabelBase = unit ? `${label} ${unit}` : label

  return (
    <div>
      {/* Label */}
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-[10px] font-display tracking-[0.15em] uppercase text-cc-gray-400">
          {label}
        </span>
        {unit && (
          <span className="px-2 py-0.5 rounded border border-cc-black-500 bg-cc-black-700 text-[9px] font-display tracking-[0.14em] uppercase text-cc-gray-300">
            {unit}
          </span>
        )}
      </div>

      {/* Inputs row */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <input
          type="text"
          inputMode="numeric"
          value={minFocused ? minText : formatValue(currentMin)}
          onFocus={(e) => {
            setMinFocused(true)
            setMinText(String(currentMin))
            requestAnimationFrame(() => e.target.select())
          }}
          onChange={(e) => setMinText(e.target.value)}
          onBlur={() => { commitMin(); setMinFocused(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
          className={`
            flex-1 min-w-0 bg-cc-black-600 rounded-lg px-3 py-2 text-xs text-center tabular-nums
            border transition-colors focus:outline-none
            ${minFocused
              ? 'border-cc-red/40 text-cc-white'
              : 'border-cc-black-500 text-cc-gray-300 hover:border-cc-gray-500 hover:text-cc-white cursor-text'
            }
          `}
        />
        <span className="text-cc-gray-500 text-xs shrink-0">—</span>
        <input
          type="text"
          inputMode="numeric"
          value={maxFocused ? maxText : formatValue(currentMax)}
          onFocus={(e) => {
            setMaxFocused(true)
            setMaxText(String(currentMax))
            requestAnimationFrame(() => e.target.select())
          }}
          onChange={(e) => setMaxText(e.target.value)}
          onBlur={() => { commitMax(); setMaxFocused(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
          className={`
            flex-1 min-w-0 bg-cc-black-600 rounded-lg px-3 py-2 text-xs text-center tabular-nums
            border transition-colors focus:outline-none
            ${maxFocused
              ? 'border-cc-red/40 text-cc-white'
              : 'border-cc-black-500 text-cc-gray-300 hover:border-cc-gray-500 hover:text-cc-white cursor-text'
            }
          `}
        />
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-1.5 rounded-full bg-cc-black-500 cursor-pointer select-none"
        onPointerDown={handleTrackClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute top-0 bottom-0 rounded-full bg-cc-red"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />

        {/* Min thumb */}
        <div
          role="slider"
          aria-valuenow={currentMin}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={`${ariaLabelBase} minimum`}
          tabIndex={0}
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[18px] h-[18px] rounded-full
            bg-cc-red border-2 border-cc-white cursor-grab active:cursor-grabbing
            transition-shadow touch-none
            ${dragging === 'min' ? 'shadow-lg shadow-cc-red/40 scale-110' : 'hover:shadow-lg hover:shadow-cc-red/30'}
          `}
          style={{ left: `${leftPct}%`, zIndex: dragging === 'min' ? 20 : 10 }}
          onPointerDown={handlePointerDown('min')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Max thumb */}
        <div
          role="slider"
          aria-valuenow={currentMax}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={`${ariaLabelBase} maximum`}
          tabIndex={0}
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[18px] h-[18px] rounded-full
            bg-cc-red border-2 border-cc-white cursor-grab active:cursor-grabbing
            transition-shadow touch-none
            ${dragging === 'max' ? 'shadow-lg shadow-cc-red/40 scale-110' : 'hover:shadow-lg hover:shadow-cc-red/30'}
          `}
          style={{ left: `${rightPct}%`, zIndex: dragging === 'max' ? 20 : 10 }}
          onPointerDown={handlePointerDown('max')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  )
}
