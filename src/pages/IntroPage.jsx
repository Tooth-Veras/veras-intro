import { useState, useEffect, useCallback, useRef } from 'react'
import { useColors, useTheme } from '../contexts/ThemeContext'
import { fetchIntroCourse } from '../lib/sanity'
import { ChevronDown, Moon, Sun, X, ZoomIn, ZoomOut } from 'lucide-react'

function Lightbox({ src, alt, onClose }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function onWheel(e) {
    e.preventDefault()
    setScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.001)))
  }

  function onMouseDown(e) {
    if (scale <= 1) return
    setDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  function onMouseMove(e) {
    if (!dragging || !dragStart.current) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }

  function onMouseUp() { setDragging(false) }

  function zoom(delta) {
    setScale(s => {
      const next = Math.min(5, Math.max(1, s + delta))
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      onWheel={onWheel}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
        animation: 'lightboxBdIn 0.22s ease both',
      }}
    >
      <img
        src={src}
        alt={alt}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        draggable={false}
        style={{
          maxWidth: '92vw', maxHeight: '90vh',
          borderRadius: 10, boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
          transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
          transformOrigin: 'center',
          transition: dragging ? 'none' : 'transform 0.15s ease',
          userSelect: 'none',
          pointerEvents: 'auto',
          animation: 'lightboxImgIn 0.35s cubic-bezier(0.34,1.4,0.64,1) both',
        }}
      />
      <div style={{
        position: 'fixed', top: 16, right: 16,
        display: 'flex', gap: 8, zIndex: 1001,
      }}>
        <button onClick={() => zoom(0.5)} style={btnStyle} title="Zoom in"><ZoomIn size={18} /></button>
        <button onClick={() => zoom(-0.5)} style={btnStyle} title="Zoom out"><ZoomOut size={18} /></button>
        <button onClick={onClose} style={btnStyle} title="Close"><X size={18} /></button>
      </div>
    </div>
  )
}

const btnStyle = {
  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: '#fff',
  display: 'flex', alignItems: 'center', backdropFilter: 'blur(8px)',
}

const GRADIENT = ['#7c3aed', '#4f46e5']

function renderBody(text) {
  if (!text) return null
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  )
}

function CoverSlide({ slide }) {
  const { isDark } = useTheme()
  const parts = (slide.title || '').split('Veras')

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', textAlign: 'center', padding: '60px 40px',
      background: isDark ? 'linear-gradient(135deg, #1e1035 0%, #0f172a 100%)' : '#f8faff',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.10)', top: -140, left: '50%', transform: 'translateX(-50%)', filter: 'blur(70px)', animation: 'orb1 12s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: isDark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.08)', bottom: -60, right: -60, filter: 'blur(70px)', animation: 'orb2 15s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)', bottom: 80, left: -40, filter: 'blur(70px)', animation: 'orb3 10s ease-in-out infinite', pointerEvents: 'none' }} />
      <img
        src="/veras-icon-real.svg"
        alt="Veras"
        style={{
          width: 100, height: 100,
          position: 'relative', zIndex: 1,
          marginBottom: 32,
          borderRadius: 24,
          boxShadow: '0 0 40px rgba(124,58,237,0.22), 0 20px 60px rgba(0,0,0,0.18)',
          animation: 'iconIn 0.6s cubic-bezier(.34,1.56,.64,1) 0.2s both, float 4s ease-in-out 1s infinite',
        }}
      />
      <h1 style={{
        fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 14,
        position: 'relative', zIndex: 1, letterSpacing: '-0.025em',
        color: isDark ? '#fff' : '#0f172a',
        animation: 'textIn 0.5s ease 0.5s both',
      }}>
        {parts[0]}<span style={{
          background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 30%, #7c3aed 50%, #a78bfa 70%, #7c3aed 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'shimmer 3s linear 1.5s infinite',
        }}>Veras</span>{parts[1]}
      </h1>
      <p style={{
        fontSize: 18, lineHeight: 1.65, maxWidth: 440,
        position: 'relative', zIndex: 1,
        color: isDark ? 'rgba(255,255,255,0.55)' : '#64748b',
        animation: 'textIn 0.5s ease 0.7s both',
      }}>
        {slide.subtitle}
      </p>
    </div>
  )
}

function TextImageSlide({ slide }) {
  const c = useColors()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const hasScreenshot = slide.imageUrl && !slide.emoji

  if (hasScreenshot) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 80px 16px',
        maxWidth: 1100, margin: '0 auto', width: '100%', gap: 20, overflow: 'hidden',
      }}>
        {lightboxOpen && <Lightbox src={slide.imageUrl} alt={slide.title} onClose={() => setLightboxOpen(false)} />}
        <div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text, lineHeight: 1.2, marginBottom: 16 }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: 17, color: c.textSec, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {renderBody(slide.body)}
          </p>
        </div>
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: 820, flex: 1, minHeight: 0 }}>
          <img
            src={slide.imageUrl}
            alt={slide.title}
            onClick={() => setLightboxOpen(true)}
            style={{
              width: '100%', maxHeight: '100%', borderRadius: 12, border: `1px solid ${c.cardBorder}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)', objectFit: 'contain',
              cursor: 'zoom-in', display: 'block',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: '4px 8px',
            fontSize: 11, color: '#fff', fontWeight: 600, pointerEvents: 'none',
            backdropFilter: 'blur(4px)', letterSpacing: '0.02em',
          }}>
            Click to expand
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', padding: '40px 80px 120px', gap: 80,
      maxWidth: 1100, margin: '0 auto', width: '100%',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>{slide.emoji}</div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text, lineHeight: 1.2, marginBottom: 20 }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: 18, color: c.textSec, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {renderBody(slide.body)}
        </p>
      </div>
    </div>
  )
}

function FlipCard({ card, i, isDark, flipped, onFlip }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef(null)

  function onMouseMove(e) {
    if (flipped || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    setTilt({ x: dy * -7, y: dx * 9 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      onClick={() => onFlip(i)}
      style={{
        perspective: '1200px', cursor: 'pointer', height: '100%',
        animation: `glassIn 0.5s cubic-bezier(.34,1.3,.64,1) ${i * 0.1 + 0.1}s both`,
      }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%', minHeight: 140,
        transformStyle: 'preserve-3d',
        transform: flipped
          ? 'rotateY(180deg)'
          : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)${hovered ? ' translateY(-6px)' : ''}`,
        transition: flipped ? 'transform 0.55s cubic-bezier(.4,1.4,.6,1)' : 'transform 0.18s ease',
      }}>
        {/* Front */}
        <div style={{
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.68)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: 18, padding: '20px 22px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          boxShadow: hovered
            ? '0 20px 48px rgba(124,58,237,0.16), 0 4px 12px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)'
            : '0 2px 8px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
          height: '100%', position: 'relative', overflow: 'hidden',
          transition: 'box-shadow 0.2s',
        }}>
          <div style={{ fontSize: 32 }}>{card.emoji}</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: isDark ? '#fff' : '#0f172a', lineHeight: 1.3 }}>{card.title}</div>
          <div style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6 }}>{card.body}</div>
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.04em',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 6, padding: '4px 10px',
            animation: 'flipHint 3s ease-in-out 1s infinite',
          }}>flip ↻</div>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 18, padding: '24px 22px',
          background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', gap: 0,
          boxShadow: '0 16px 48px rgba(109,40,217,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}>
          {card.backStat ? (
            <>
              <div style={{
                fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.15,
                letterSpacing: '-0.01em', marginBottom: 8,
              }}>{card.backStat}</div>
              <div style={{ width: 28, height: 2, background: 'rgba(255,255,255,0.35)', borderRadius: 2, marginBottom: 10 }} />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>{card.backBody}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{card.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>{card.body}</div>
            </>
          )}
          <div style={{
            marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.4)',
            fontWeight: 600, letterSpacing: '0.04em',
          }}>↩ click to flip back</div>
        </div>
      </div>
    </div>
  )
}

function FeatureCardsSlide({ slide }) {
  const { isDark } = useTheme()
  const [flippedIdx, setFlippedIdx] = useState(null)

  function handleFlip(i) {
    setFlippedIdx(prev => prev === i ? null : i)
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      position: 'relative', overflow: 'hidden',
      background: isDark ? 'linear-gradient(135deg, #1e1035 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ede9fe 0%, #f8fafc 40%, #e0f2fe 100%)',
    }}>
      <div style={{ position: 'absolute', width: 500, height: 400, background: isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.12)', top: -120, left: -80, filter: 'blur(90px)', animation: 'liquidShift 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 350, background: isDark ? 'rgba(59,130,246,0.14)' : 'rgba(59,130,246,0.10)', bottom: -80, right: -80, filter: 'blur(90px)', animation: 'liquidShift 8s ease-in-out infinite', animationDelay: '-4s', pointerEvents: 'none' }} />
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 80px 16px', maxWidth: 900, margin: '0 auto', width: '100%',
      }}>
        {slide.eyebrow && (
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            {slide.eyebrow}
          </div>
        )}
        <h2 style={{ fontSize: 30, fontWeight: 800, color: isDark ? '#fff' : '#0f172a', lineHeight: 1.2, marginBottom: 20, textAlign: 'center' }}>
          {slide.title}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 12, width: '100%' }}>
          {(slide.cards || []).map((card, i) => (
            <FlipCard key={card._key || i} card={card} i={i} isDark={isDark} flipped={flippedIdx === i} onFlip={handleFlip} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PhonesSlide({ slide }) {
  const c = useColors()
  const phones = slide.phones || []
  const rotations = [-4, 0, 4]
  const [hoveredIdx, setHoveredIdx] = useState(null)

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '24px 40px 16px', gap: 16, textAlign: 'center',
    }}>
      <div>
        {slide.eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            {slide.eyebrow}
          </div>
        )}
        <h2 style={{ fontSize: 34, fontWeight: 800, color: c.text, lineHeight: 1.2, marginBottom: 10 }}>
          {slide.title}
        </h2>
        {slide.body && (
          <p style={{ fontSize: 16, color: c.textSec, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            {slide.body}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', justifyContent: 'center' }}>
        {phones.map((phone, i) => {
          const isHovered = hoveredIdx === i
          const isOther = hoveredIdx !== null && !isHovered
          return (
            <div
              key={phone._key || i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                transform: isHovered
                  ? 'rotate(0deg) scale(1.24) translateY(-10px)'
                  : isOther
                    ? `rotate(${rotations[i] || 0}deg) scale(0.96)`
                    : `rotate(${rotations[i] || 0}deg) scale(1)`,
                transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease',
                opacity: isOther ? 0.72 : 1,
                zIndex: isHovered ? 10 : 1,
                cursor: 'zoom-in',
                willChange: 'transform',
              }}
            >
              <img
                src={phone.imageUrl}
                alt={phone.label}
                style={{
                  height: 'min(370px, calc(100vh - 380px))', width: 'auto',
                  borderRadius: 28,
                  boxShadow: isHovered
                    ? '0 40px 90px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(124,58,237,0.25)'
                    : '0 32px 80px rgba(0,0,0,0.45)',
                  imageRendering: 'crisp-edges',
                  transition: 'box-shadow 0.4s ease',
                }}
              />
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: isHovered ? '#7c3aed' : '#64748b',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'color 0.3s ease',
              }}>
                {phone.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const DRIFT_PARTICLES = [
  { left: '12%', bottom: '18%', dx: '-28px', dur: '5.2s', delay: '0s',   size: 3 },
  { left: '22%', bottom: '28%', dx:  '18px', dur: '6.1s', delay: '0.8s', size: 2 },
  { left: '35%', bottom: '12%', dx: '-35px', dur: '4.8s', delay: '1.5s', size: 3 },
  { left: '48%', bottom: '22%', dx:  '22px', dur: '5.7s', delay: '2.2s', size: 2 },
  { left: '60%', bottom: '15%', dx: '-18px', dur: '6.4s', delay: '0.5s', size: 3 },
  { left: '72%', bottom: '30%', dx:  '32px', dur: '5.0s', delay: '1.8s', size: 2 },
  { left: '82%', bottom: '20%', dx: '-25px', dur: '4.6s', delay: '3.0s', size: 3 },
  { left: '18%', bottom: '35%', dx:  '15px', dur: '7.2s', delay: '0.3s', size: 2 },
  { left: '55%', bottom: '38%', dx: '-20px', dur: '5.5s', delay: '2.8s', size: 2 },
  { left: '40%', bottom: '32%', dx:  '28px', dur: '6.8s', delay: '1.2s', size: 3 },
  { left: '67%', bottom: '25%', dx: '-12px', dur: '5.3s', delay: '4.0s', size: 2 },
  { left: '30%', bottom: '42%', dx:  '35px', dur: '4.9s', delay: '2.5s', size: 2 },
]

const CHIP_DETAILS = {
  'Open shifts': 'Veras spots unfilled shifts in your schedule and surfaces them with a one-tap option to broadcast to staff phones or remove them to clean up your view.',
  'Overstaffed': 'When a position exceeds your budget target, Veras flags it before it costs you — with a specific shift suggested for removal.',
  'Budget optimization': 'Veras compares your scheduled hours against your PPD target and surfaces exactly which shifts to trim, before you go over.',
}

function StatementSlide({ slide }) {
  const c = useColors()
  const { isDark } = useTheme()
  const useDarkGradient = slide.gradientBg && isDark
  const [activeChip, setActiveChip] = useState(null)

  const titleColor = useDarkGradient ? '#fff' : c.text
  const bodyColor = useDarkGradient ? 'rgba(255,255,255,0.6)' : c.textSec

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      position: 'relative', overflow: 'hidden',
      background: useDarkGradient ? 'linear-gradient(160deg, #1e1035, #0f172a)' : 'transparent',
    }}>
      {slide.gradientBg && DRIFT_PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
          background: useDarkGradient ? 'rgba(167,139,250,0.5)' : 'rgba(124,58,237,0.35)',
          width: p.size, height: p.size, left: p.left, bottom: p.bottom,
          '--dx': p.dx,
          animation: `particleDrift ${p.dur} ease-in ${p.delay} infinite`,
        }} />
      ))}
      {slide.gradientBg && (
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, ${useDarkGradient ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.07)'} 0%, transparent 70%)`,
          top: -150, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 80px 16px', maxWidth: 860, width: '100%', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {slide.showLogo && (
          <img src="/veras-app-icon.svg" alt="Veras" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 32, boxShadow: '0 8px 32px rgba(124,58,237,0.3)', flexShrink: 0, animation: 'iconIn 0.5s cubic-bezier(.34,1.3,.64,1) both' }} />
        )}
        {slide.eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 800, color: useDarkGradient ? '#a78bfa' : '#7c3aed', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, animation: 'textIn 0.45s ease both' }}>
            {slide.eyebrow}
          </div>
        )}
        <h2 style={{
          fontSize: slide.gradientBg ? 48 : 38, fontWeight: slide.gradientBg ? 900 : 800,
          color: titleColor, lineHeight: 1.1, marginBottom: 24,
          letterSpacing: slide.gradientBg ? '-0.02em' : 0,
          animation: 'textIn 0.5s 0.07s ease both',
        }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: 19, color: bodyColor, lineHeight: 1.7, maxWidth: 560, marginBottom: 40, animation: 'textIn 0.5s 0.15s ease both' }}>
          {slide.body}
        </p>
        {(slide.chips || []).some(c => !!CHIP_DETAILS[c]) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: slide.bearUrl ? 24 : 0, width: '100%' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {slide.chips.map((chip, i) => {
                const isInteractive = !!CHIP_DETAILS[chip]
                const isActive = activeChip === chip
                if (isInteractive) {
                  return (
                    <button key={i} onClick={() => setActiveChip(prev => prev === chip ? null : chip)} style={{
                      background: isActive ? '#7c3aed' : (useDarkGradient ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.12)'),
                      border: `1.5px solid ${isActive ? '#7c3aed' : (useDarkGradient ? 'rgba(255,255,255,0.25)' : 'rgba(124,58,237,0.3)')}`,
                      borderRadius: 99, padding: '9px 20px',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      color: isActive ? '#fff' : (useDarkGradient ? '#fff' : '#7c3aed'),
                      animation: isActive ? `chipIn 0.4s cubic-bezier(.34,1.56,.64,1) ${i * 0.12 + 0.25}s both` : `chipIn 0.4s cubic-bezier(.34,1.56,.64,1) ${i * 0.12 + 0.25}s both, chipPulse 2.5s ease-in-out ${i * 0.4 + 1.2}s infinite`,
                      transition: 'background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s, box-shadow 0.15s',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isActive ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                    }}>✦ {chip}</button>
                  )
                }
                return (
                  <div key={i} style={{
                    background: useDarkGradient ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderRadius: 99, padding: '6px 16px',
                    fontSize: 12, fontWeight: 500,
                    color: useDarkGradient ? 'rgba(255,255,255,0.5)' : '#94a3b8',
                    animation: `textIn 0.4s ease ${i * 0.08 + 0.2}s both`,
                    letterSpacing: '0.01em',
                  }}>{chip}</div>
                )
              })}
            </div>
            {activeChip && (
              <div style={{ width: '100%', maxWidth: 480, animation: 'textIn 0.3s ease both' }}>
                <div style={{
                  background: useDarkGradient ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.08)',
                  border: `1px solid ${useDarkGradient ? 'rgba(255,255,255,0.15)' : 'rgba(124,58,237,0.2)'}`,
                  borderRadius: 12, padding: '12px 16px',
                  fontSize: 13, lineHeight: 1.6,
                  color: useDarkGradient ? 'rgba(255,255,255,0.8)' : '#475569',
                  textAlign: 'center',
                }}>
                  {CHIP_DETAILS[activeChip]}
                </div>
              </div>
            )}
          </div>
        )}
        {slide.bearUrl && (
          <img src={slide.bearUrl} alt="" style={{ width: 160, height: 160, objectFit: 'contain', marginTop: 8, animation: 'iconIn 0.5s 0.3s ease both' }} />
        )}
      </div>
    </div>
  )
}

function StepsSlide({ slide }) {
  const c = useColors()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const steps = slide.steps || []

  return (
    <div style={{
      flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
      alignItems: 'center', gap: 48,
      padding: '48px 64px 100px', maxWidth: 1200, margin: '0 auto', width: '100%',
    }}>
      {lightboxOpen && slide.imageUrl && (
        <Lightbox src={slide.imageUrl} alt={slide.title} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Left — steps */}
      <div>
        {slide.eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            {slide.eyebrow}
          </div>
        )}
        <h2 style={{ fontSize: 30, fontWeight: 800, color: c.text, lineHeight: 1.2, marginBottom: 40 }}>
          {slide.title}
        </h2>
        <div>
          {steps.map((step, i) => (
            <div key={step._key || i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 36 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff',
                  boxShadow: '0 0 0 4px rgba(124,58,237,0.15)', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 24, background: 'linear-gradient(to bottom, rgba(124,58,237,0.35), transparent)', marginTop: 5 }} />
                )}
              </div>
              <div style={{ paddingTop: 6, paddingBottom: 28 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 5 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: c.textSec, lineHeight: 1.65 }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — screenshot */}
      {slide.imageUrl && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <img
              src={slide.imageUrl}
              alt={slide.title}
              onClick={() => setLightboxOpen(true)}
              style={{
                width: '100%', borderRadius: 14, border: `1px solid ${c.cardBorder}`,
                boxShadow: '0 24px 64px rgba(0,0,0,0.3)', display: 'block', cursor: 'zoom-in',
              }}
            />
            {slide.imageChip && (
              <div style={{
                position: 'absolute', bottom: 12, right: 12,
                background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(8px)',
                borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#fff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                whiteSpace: 'nowrap',
              }}>
                {slide.imageChip}
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 10, left: 10,
              background: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: '4px 8px',
              fontSize: 11, color: '#fff', fontWeight: 600, pointerEvents: 'none',
              backdropFilter: 'blur(4px)', letterSpacing: '0.02em',
            }}>
              Click to expand
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HotspotSlide({ slide }) {
  const { isDark } = useTheme()
  const views = slide.views || []
  const hasViews = views.length > 1
  const [activeView, setActiveView] = useState(0)
  const [activeIdx, setActiveIdx] = useState(null)
  const [viewed, setViewed] = useState(new Set())
  const [popupAnchor, setPopupAnchor] = useState(null)
  const pinRefs = useRef([])
  const [showDayModal, setShowDayModal] = useState(false)
  const [dayModalShown, setDayModalShown] = useState(false)

  const currentView = hasViews ? views[activeView] : null
  const hotspots = (currentView ? currentView.hotspots : slide.hotspots) || []
  const imageUrl = currentView ? currentView.imageUrl : slide.imageUrl
  const viewDescription = currentView ? currentView.description : (slide.body || 'Click each pin to explore.')
  const activeHotspot = activeIdx !== null ? hotspots[activeIdx] : null
  const allExplored = hotspots.length > 0 && viewed.size >= hotspots.length

  function switchView(i) { setActiveView(i); setActiveIdx(null); setPopupAnchor(null); setViewed(new Set()); pinRefs.current = [] }
  function openHotspot(i) {
    const key = hotspots[i]._key || String(i)
    setActiveIdx(i)
    setViewed(prev => new Set([...prev, key]))
    const el = pinRefs.current[i]
    if (el) setPopupAnchor(el.getBoundingClientRect())
  }
  function closeHotspot() { setActiveIdx(null); setPopupAnchor(null) }
  function prevHotspot() { openHotspot((activeIdx - 1 + hotspots.length) % hotspots.length) }
  function nextHotspot() {
    const next = (activeIdx + 1) % hotspots.length
    if (next === 0 && allExplored) { closeHotspot(); return }
    openHotspot(next)
  }

  function getFixedPopupStyle() {
    if (!popupAnchor) return {}
    const W = 288, GAP = 12
    const style = { position: 'fixed', width: W, zIndex: 1000 }
    if (popupAnchor.right + GAP + W < window.innerWidth) {
      style.left = popupAnchor.right + GAP
    } else {
      style.right = window.innerWidth - popupAnchor.left + GAP
    }
    const topSpace = window.innerHeight - popupAnchor.top - 8
    const botSpace = popupAnchor.bottom - 8
    if (topSpace >= botSpace) {
      style.top = popupAnchor.top
      style.maxHeight = topSpace
    } else {
      style.bottom = window.innerHeight - popupAnchor.bottom
      style.maxHeight = botSpace
    }
    return style
  }

  useEffect(() => {
    if (allExplored && activeIdx === null && hasViews && activeView === 0 && !dayModalShown) {
      setShowDayModal(true); setDayModalShown(true)
    }
  }, [allExplored, activeIdx, activeView, hasViews, dayModalShown])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '12px 24px 14px', textAlign: 'center',
        background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(237,233,254,0.85)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--c-border)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text)', marginBottom: hasViews ? 6 : 2 }}>{slide.title}</h2>
        {hasViews && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
            {views.map((v, i) => (
              <button key={v._key || i} onClick={() => switchView(i)} style={{
                padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: activeView === i ? '#7c3aed' : 'transparent',
                color: activeView === i ? '#fff' : '#64748b',
                border: `1.5px solid ${activeView === i ? '#7c3aed' : 'var(--c-border)'}`,
                transition: 'all 0.15s',
              }}>{v.label}</button>
            ))}
          </div>
        )}
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 0 }}>
          {!allExplored && hotspots.length > 0
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#7c3aed' }}>
                  Click the numbered pins
                </span>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{viewed.size}/{hotspots.length} explored</span>
              </span>
            : viewDescription
          }
        </p>
      </div>

      {/* Image + pins */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 16px 4px', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', flexShrink: 1 }}>
          {imageUrl && (
            <img src={imageUrl} alt={slide.title} draggable={false} style={{
              display: 'block', maxWidth: '100%', maxHeight: 'calc(100vh - 240px)',
              width: 'auto', height: 'auto', borderRadius: 8, border: '1px solid #334155',
              boxShadow: '0 6px 40px rgba(0,0,0,0.3)', userSelect: 'none',
            }} />
          )}
          {hotspots.map((h, i) => {
            const key = h._key || String(i)
            const isActive = activeIdx === i
            const isViewed = viewed.has(key)
            return (
              <div key={key} style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%,-50%)', width: 34, height: 34, zIndex: isActive ? 60 : 30 }}>
                <button
                  ref={el => { pinRefs.current[i] = el }}
                  onClick={e => { e.stopPropagation(); isActive ? closeHotspot() : openHotspot(i) }}
                  title={h.label}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : isViewed ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#fde68a,#facc15)',
                    border: `2.5px solid ${isActive ? '#a78bfa' : isViewed ? '#6ee7b7' : '#a16207'}`,
                    boxShadow: isActive ? '0 0 0 4px rgba(124,58,237,0.3)' : isViewed ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.35)',
                    color: isActive || isViewed ? '#fff' : '#1e293b',
                    fontWeight: 800, fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                    animation: !isActive && !isViewed ? 'pinPulse 2.5s ease-in-out infinite' : 'none',
                  }}
                >{isViewed && !isActive ? '✓' : i + 1}</button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Backdrop */}
      {activeIdx !== null && (
        <div onClick={closeHotspot} style={{ position: 'absolute', inset: 0, zIndex: 20, cursor: 'default' }} />
      )}

      {/* Fixed popup next to pin */}
      {activeIdx !== null && activeHotspot && popupAnchor && (
        <div onClick={e => e.stopPropagation()} style={{
          ...getFixedPopupStyle(),
          background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)', border: '1px solid #e2e8f0',
          overflow: 'hidden', animation: 'glassIn 0.18s ease both',
        }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', lineHeight: 1.3 }}>{activeHotspot.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button onClick={e => { e.stopPropagation(); prevHotspot() }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 12, fontWeight: 700 }}>‹</button>
              <button onClick={e => { e.stopPropagation(); nextHotspot() }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 12, fontWeight: 700 }}>›</button>
              <button onClick={e => { e.stopPropagation(); closeHotspot() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', marginLeft: 2 }}><X size={13} /></button>
            </div>
          </div>
          <div style={{ padding: '10px 14px 12px', overflowY: 'auto' }}>
            <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{activeHotspot.description}</p>
            <div style={{ marginTop: 8, fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>{activeIdx + 1} / {hotspots.length}</div>
          </div>
        </div>
      )}

      {/* Day View modal */}
      {showDayModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '36px 32px 28px',
            maxWidth: 400, width: '90%', textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            animation: 'glassIn 0.25s ease both',
          }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗓️</div>
            <h3 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 10 }}>Week View down!</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, marginBottom: 26 }}>
              Now try <strong style={{ color: '#0f172a' }}>Day View</strong> — it gives you a live staffing snapshot for today: who's on, where they're assigned, and where the gaps are.
            </p>
            <button onClick={() => { setShowDayModal(false); switchView(1) }} style={{
              width: '100%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              border: 'none', borderRadius: 12, padding: '13px 0',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            }}>Try Day View →</button>
          </div>
        </div>
      )}
    </div>
  )
}

function SupportSlide() {
  const { isDark } = useTheme()

  const linkStyle = { color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }

  const cards = [
    {
      emoji: '💬',
      iconBg: 'rgba(124,58,237,0.15)',
      label: 'Live Chat',
      body: 'Chat with a real person inside Veras — or ask our AI Agent anytime.',
      link: (
        <button
          onClick={() => { if (typeof window.Intercom === 'function') window.Intercom('show') }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', ...linkStyle }}
        >
          Open Live Chat
        </button>
      ),
    },
    {
      emoji: '✉️',
      iconBg: 'rgba(16,185,129,0.12)',
      label: 'Email Support',
      body: 'Send us a message and we\'ll get back to you fast — usually same day.',
      link: <a href="mailto:support@veras.com" style={linkStyle}>support@veras.com</a>,
    },
    {
      emoji: '📚',
      iconBg: 'rgba(59,130,246,0.12)',
      label: 'Help Center',
      body: 'Step-by-step guides, how-tos, and answers for admins and staff alike.',
      link: <a href="https://help.veras.com/en/" target="_blank" rel="noreferrer" style={linkStyle}>help.veras.com</a>,
    },
  ]

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      padding: '36px 80px 16px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
      background: isDark ? 'linear-gradient(160deg, #1e1035 0%, #0f172a 60%, #0c1226 100%)' : 'linear-gradient(145deg, #ede9fe 0%, #f8fafc 40%, #e0f2fe 100%)',
    }}>
      <div style={{ position: 'absolute', width: 500, height: 400, background: isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.12)', top: -120, left: -80, filter: 'blur(90px)', animation: 'liquidShift 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 350, background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.10)', bottom: -80, right: -80, filter: 'blur(90px)', animation: 'liquidShift 8s ease-in-out infinite', animationDelay: '-4s', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 280, background: isDark ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.08)', bottom: 60, left: '20%', filter: 'blur(90px)', animation: 'liquidShift 8s ease-in-out infinite', animationDelay: '-2s', pointerEvents: 'none' }} />

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 14, position: 'relative', zIndex: 1 }}>
        White-Glove Support
      </div>

      <h2 style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.025em', marginBottom: 14, position: 'relative', zIndex: 1, color: isDark ? '#fff' : '#0f172a' }}>
        We're with you<br />every step of the way.
      </h2>

      <p style={{ fontSize: 17, color: isDark ? 'rgba(255,255,255,0.48)' : '#64748b', lineHeight: 1.6, maxWidth: 460, marginBottom: 44, position: 'relative', zIndex: 1 }}>
        Questions, issues, or just getting started — our team is here however you need us.
      </p>

      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 860, position: 'relative', zIndex: 1 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            flex: 1,
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: 20, padding: '28px 20px 22px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
            position: 'relative', overflow: 'hidden',
            animation: `glassIn 0.5s cubic-bezier(.34,1.3,.64,1) ${i * 0.1 + 0.1}s both`,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {c.emoji}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#0f172a' }}>{c.label}</div>
            <div style={{ fontSize: 12.5, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>{c.body}</div>
            <div style={{ fontSize: 12, background: 'rgba(124,58,237,0.12)', borderRadius: 6, padding: '5px 12px', marginTop: 4 }}>
              {c.link}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChecklistSlide({ slide, checked, onToggle }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 80px', maxWidth: 700, margin: '0 auto', width: '100%',
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{slide.emoji}</div>
      <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-text)', marginBottom: 32, textAlign: 'center' }}>{slide.title}</h2>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(slide.items || []).map((item, i) => (
          <div
            key={i}
            onClick={() => onToggle(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              background: checked.includes(i) ? '#f0fdf4' : 'var(--c-card)',
              border: `1px solid ${checked.includes(i) ? '#86efac' : 'var(--c-border)'}`,
              borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: checked.includes(i) ? '#059669' : 'var(--c-card)',
              border: `2px solid ${checked.includes(i) ? '#059669' : '#cbd5e1'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 800, transition: 'all 0.15s',
            }}>
              {checked.includes(i) ? '✓' : ''}
            </div>
            <span style={{ fontSize: 15, color: 'var(--c-text)' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BadgeSlide({ slide }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 40px', textAlign: 'center',
      background: `linear-gradient(135deg, ${GRADIENT[0]}15, ${GRADIENT[1]}15)`,
    }}>
      <svg width="120" height="140" viewBox="0 0 120 140" style={{ marginBottom: 28 }}>
        <defs>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={GRADIENT[0]} />
            <stop offset="100%" stopColor={GRADIENT[1]} />
          </linearGradient>
        </defs>
        <path d="M60 5 L105 25 L105 75 Q105 115 60 135 Q15 115 15 75 L15 25 Z" fill="url(#badgeGrad)" />
        <path d="M60 15 L97 32 L97 75 Q97 108 60 125 Q23 108 23 75 L23 32 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        <text x="60" y="82" textAnchor="middle" fill="white" fontSize="38" fontWeight="bold">★</text>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        {slide.badgeLabel || 'Welcome Aboard'}
      </div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--c-text)', lineHeight: 1.2, marginBottom: 16 }}>
        {slide.title}
      </h2>
      <p style={{ fontSize: 18, color: 'var(--c-sec)', lineHeight: 1.6, maxWidth: 480 }}>
        {slide.body}
      </p>
    </div>
  )
}

function renderSlide(slide, checked, onToggle) {
  if (!slide) return null
  switch (slide.type) {
    case 'cover':      return <CoverSlide slide={slide} />
    case 'text_image':     return <TextImageSlide slide={slide} />
    case 'feature_cards': return <FeatureCardsSlide slide={slide} />
    case 'phones':     return <PhonesSlide slide={slide} />
    case 'statement':  return <StatementSlide slide={slide} />
    case 'steps':      return <StepsSlide slide={slide} />
    case 'hotspot':    return <HotspotSlide slide={slide} />
    case 'support':    return <SupportSlide />
    case 'checklist':  return <ChecklistSlide slide={slide} checked={checked} onToggle={onToggle} />
    case 'badge':      return <BadgeSlide slide={slide} />
    default:           return <TextImageSlide slide={slide} />
  }
}

export default function IntroPage() {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [checklistChecked, setChecklistChecked] = useState([])
  const scrollRef = useRef(null)
  const c = useColors()
  const { isDark, toggle } = useTheme()

  useEffect(() => {
    fetchIntroCourse()
      .then(setCourse)
      .catch(err => { console.error(err); setError(err.message) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setChecklistChecked([])
  }, [slideIndex])

  useEffect(() => {
    document.title = 'Welcome to Veras'
  }, [])

  function handleScroll(e) {
    const el = e.currentTarget
    if (!el.clientHeight) return
    const newIndex = Math.round(el.scrollTop / el.clientHeight)
    if (newIndex !== slideIndex) setSlideIndex(newIndex)
  }

  function scrollToSlide(i) {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: i * el.clientHeight, behavior: 'smooth' })
  }

  const goNext = useCallback(() => {
    if (!course || slideIndex >= course.slides.length - 1) return
    scrollToSlide(slideIndex + 1)
  }, [slideIndex, course])

  const goPrev = useCallback(() => {
    if (slideIndex <= 0) return
    scrollToSlide(slideIndex - 1)
  }, [slideIndex])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])


  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg }}>
        <div style={{ color: '#94a3b8', fontSize: 15 }}>Loading…</div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg }}>
        <div style={{ color: '#ef4444', fontSize: 15 }}>Failed to load content. Please try again.</div>
      </div>
    )
  }

  const slide = course.slides[Math.min(slideIndex, course.slides.length - 1)]
  const isLastSlide = slideIndex === course.slides.length - 1
  const slidesLeft = course.slides.length - 1 - slideIndex
  const nudgeText = slidesLeft === 1 ? 'One more slide!' : slidesLeft === 2 ? 'Almost there!' : 'Scroll to continue'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: c.bg, transition: 'background-color 0.25s' }}>
      <style>{`
        @keyframes bounce-arrow { 0%,100%{transform:translateY(0);opacity:.7} 50%{transform:translateY(7px);opacity:1} }
        @keyframes fade-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(40px,-30px)} 66%{transform:translate(-20px,20px)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-50px,30px)} 66%{transform:translate(30px,-40px)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,35px)} }
        @keyframes iconIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes textIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes chipIn { from{opacity:0;transform:scale(0.85) translateY(8px)} to{opacity:1;transform:none} }
        @keyframes particleDrift { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:.8} 90%{opacity:.4} 100%{transform:translateY(-100px) translateX(var(--dx));opacity:0} }
        @keyframes liquidShift { 0%,100%{border-radius:60% 40% 30% 70% / 60% 30% 70% 40%} 25%{border-radius:30% 60% 70% 40% / 50% 60% 30% 60%} 50%{border-radius:50% 50% 40% 60% / 40% 70% 30% 60%} 75%{border-radius:40% 60% 50% 50% / 60% 40% 60% 40%} }
        @keyframes glassIn { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes lightboxBdIn { from{opacity:0} to{opacity:1} }
        @keyframes lightboxImgIn { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} }
        @keyframes flipHint { 0%,70%,100%{opacity:0.5;transform:scale(1)} 85%{opacity:1;transform:scale(1.15)} }
        @keyframes pinPulse { 0%,100%{box-shadow:0 2px 8px rgba(0,0,0,0.35)} 50%{box-shadow:0 0 0 8px rgba(250,204,21,0.2),0 2px 8px rgba(0,0,0,0.35)} }
        @keyframes chipPulse { 0%,60%,100%{transform:scale(1);box-shadow:none} 80%{transform:scale(1.06);box-shadow:0 0 0 4px rgba(124,58,237,0.18)} }
      `}</style>

      {/* Top nav */}
      <div style={{
        background: c.navBg, borderBottom: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, flexShrink: 0, position: 'relative',
      }}>
        <img src="/veras-logo.png" alt="Veras" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />

        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {slideIndex + 1} of {course.slides.length}
          </div>
        </div>

        <button
          onClick={toggle}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
            color: '#94a3b8', display: 'flex', alignItems: 'center',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'scroll', scrollSnapType: 'y mandatory' }}
        >
          {course.slides.map((s, i) => (
            <div key={s._key || i} style={{
              height: 'calc(100vh - 56px)',
              scrollSnapAlign: 'start',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              paddingBottom: 72,
              background: isDark ? 'linear-gradient(135deg, #1e1035 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ede9fe 0%, #f8fafc 40%, #e0f2fe 100%)',
            }}>
              {renderSlide(s, checklistChecked, j => setChecklistChecked(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]))}
            </div>
          ))}
        </div>

        {/* Slide sidebar */}
        <div style={{
          width: 48, background: '#1e293b', display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '20px 0', gap: 10, flexShrink: 0,
        }}>
          {course.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i === slideIndex ? '#7c3aed' : i < slideIndex ? '#334155' : '#0f172a',
                border: i === slideIndex ? '2px solid #a78bfa' : '2px solid transparent',
                color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav: Prev / progress / Next */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: '10px 24px 14px',
        background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.88)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        zIndex: 10,
      }}>
        <button
          onClick={goPrev}
          disabled={slideIndex === 0}
          style={{
            background: 'transparent',
            border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
            borderRadius: 99, padding: '7px 18px',
            fontSize: 13, fontWeight: 600,
            color: slideIndex === 0 ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : (isDark ? '#e2e8f0' : '#475569'),
            cursor: slideIndex === 0 ? 'default' : 'pointer',
            transition: 'all 0.15s',
          }}
        >← Back</button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, maxWidth: 160 }}>
          <div style={{ width: '100%', height: 3, background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: `linear-gradient(90deg, ${GRADIENT[0]}, ${GRADIENT[1]})`,
              width: `${((slideIndex + 1) / course.slides.length) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8', fontWeight: 600, letterSpacing: '0.04em' }}>
            {slideIndex + 1} / {course.slides.length}
          </span>
        </div>

        {!isLastSlide ? (
          <button
            onClick={goNext}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', borderRadius: 99, padding: '7px 18px',
              fontSize: 13, fontWeight: 700, color: '#fff',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
              transition: 'opacity 0.15s',
            }}
          >Next →</button>
        ) : (
          <div style={{ width: 80 }} />
        )}
      </div>
    </div>
  )
}
