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
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${GRADIENT[0]}22, ${GRADIENT[1]}22)`,
      padding: '60px 40px', textAlign: 'center',
    }}>
      <img src="/veras-app-icon.svg" alt="Veras" style={{ width: 120, height: 120, marginBottom: 32 }} />
      <h1 style={{ fontSize: 42, fontWeight: 800, color: 'var(--c-text)', lineHeight: 1.15, marginBottom: 16, maxWidth: 600 }}>
        {slide.title}
      </h1>
      <p style={{ fontSize: 20, color: 'var(--c-sec)', lineHeight: 1.6, maxWidth: 520 }}>
        {slide.subtitle}
      </p>
      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 14 }}>
        <ChevronDown size={18} /> Scroll down or use ↓ to advance
      </div>
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
        flex: 1, display: 'flex', flexDirection: 'column', padding: '36px 80px 100px',
        maxWidth: 1100, margin: '0 auto', width: '100%', gap: 28,
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
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: 820 }}>
          <img
            src={slide.imageUrl}
            alt={slide.title}
            onClick={() => setLightboxOpen(true)}
            style={{
              width: '100%', borderRadius: 12, border: `1px solid ${c.cardBorder}`,
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

function FeatureCardsSlide({ slide }) {
  const c = useColors()
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 80px 120px', maxWidth: 900, margin: '0 auto', width: '100%',
    }}>
      {slide.eyebrow && (
        <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          {slide.eyebrow}
        </div>
      )}
      <h2 style={{ fontSize: 36, fontWeight: 800, color: c.text, lineHeight: 1.2, marginBottom: 40, textAlign: 'center' }}>
        {slide.title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }}>
        {(slide.cards || []).map((card, i) => (
          <div key={card._key || i} style={{
            background: 'var(--c-card)', border: `1px solid ${c.cardBorder}`,
            borderRadius: 14, padding: '24px',
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <div style={{ fontSize: 30, flexShrink: 0, lineHeight: 1.2 }}>{card.emoji}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: c.text, marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: 14, color: c.textSec, lineHeight: 1.65 }}>{card.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhonesSlide({ slide }) {
  const c = useColors()
  const phones = slide.phones || []
  const rotations = [-4, 0, 4]

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 60px 80px', gap: 32, textAlign: 'center',
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
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', justifyContent: 'center' }}>
        {phones.map((phone, i) => (
          <div key={phone._key || i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            transform: `rotate(${rotations[i] || 0}deg)`,
            transition: 'transform 0.2s',
          }}>
            <img
              src={phone.imageUrl}
              alt={phone.label}
              style={{
                height: 340, width: 'auto',
                borderRadius: 24,
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {phone.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatementSlide({ slide }) {
  const c = useColors()
  const { isDark } = useTheme()
  const useDarkGradient = slide.gradientBg && isDark

  const titleColor = useDarkGradient ? '#fff' : c.text
  const bodyColor = useDarkGradient ? 'rgba(255,255,255,0.6)' : c.textSec

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      background: useDarkGradient ? 'linear-gradient(160deg, #1e1035, #0f172a)' : 'transparent',
    }}>
      {useDarkGradient && (
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          top: -150, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '60px 120px 100px', maxWidth: 860, width: '100%', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {slide.showLogo && (
          <img src="/veras-app-icon.svg" alt="Veras" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 32, boxShadow: '0 8px 32px rgba(124,58,237,0.3)', flexShrink: 0 }} />
        )}
        {slide.eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 800, color: useDarkGradient ? '#a78bfa' : '#7c3aed', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            {slide.eyebrow}
          </div>
        )}
        <h2 style={{
          fontSize: slide.gradientBg ? 48 : 38, fontWeight: slide.gradientBg ? 900 : 800,
          color: titleColor, lineHeight: 1.1, marginBottom: 24,
          letterSpacing: slide.gradientBg ? '-0.02em' : 0,
        }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: 19, color: bodyColor, lineHeight: 1.7, maxWidth: 560, marginBottom: 40 }}>
          {slide.body}
        </p>
        {(slide.chips || []).length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: slide.bearUrl ? 24 : 0 }}>
            {slide.chips.map((chip, i) => (
              <div key={i} style={{
                background: useDarkGradient ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.12)',
                border: `1px solid ${useDarkGradient ? 'rgba(255,255,255,0.2)' : 'rgba(124,58,237,0.3)'}`,
                borderRadius: 99, padding: useDarkGradient ? '9px 20px' : '8px 18px',
                fontSize: 13, fontWeight: useDarkGradient ? 700 : 600,
                color: useDarkGradient ? '#fff' : '#a78bfa',
              }}>
                ✦ {chip}
              </div>
            ))}
          </div>
        )}
        {slide.bearUrl && (
          <img src={slide.bearUrl} alt="" style={{ width: 160, height: 160, objectFit: 'contain', marginTop: 8 }} />
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
  const views = slide.views || []
  const hasViews = views.length > 1
  const [activeView, setActiveView] = useState(0)
  const [activeIdx, setActiveIdx] = useState(null)
  const [viewed, setViewed] = useState(new Set())
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const wrapRef = useRef(null)

  const currentView = hasViews ? views[activeView] : null
  const hotspots = (currentView ? currentView.hotspots : slide.hotspots) || []
  const imageUrl = currentView ? currentView.imageUrl : slide.imageUrl
  const viewDescription = currentView ? currentView.description : (slide.body || 'Click each pin to explore.')
  const activeHotspot = activeIdx !== null ? hotspots[activeIdx] : null

  function switchView(i) {
    setActiveView(i)
    setActiveIdx(null)
    setViewed(new Set())
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const handler = e => {
      e.preventDefault()
      setScale(s => {
        const next = Math.min(4, Math.max(1, s - e.deltaY * 0.001))
        if (next === 1) setOffset({ x: 0, y: 0 })
        return next
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

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

  function openHotspot(i) {
    const key = hotspots[i]._key || String(i)
    setActiveIdx(i)
    setViewed(prev => new Set([...prev, key]))
  }
  function closeHotspot() { setActiveIdx(null) }
  function prevHotspot() { openHotspot((activeIdx - 1 + hotspots.length) % hotspots.length) }
  function nextHotspot() { openHotspot((activeIdx + 1) % hotspots.length) }

  function getPopupStyle(h) {
    if (!h) return {}
    const isLeft = h.x < 50
    const style = { position: 'absolute', width: '38%', minWidth: 220, maxWidth: 340 }
    if (isLeft) { style.left = `${Math.max(h.x + 3, 19)}%` }
    else { style.right = `${Math.max(100 - h.x + 3, 5)}%` }
    style.top = `${Math.max(2, Math.min(68, h.y - 12))}%`
    return style
  }

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
        cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div style={{
        flexShrink: 0, padding: '10px 24px 10px', textAlign: 'center',
        background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-text)', marginBottom: hasViews ? 8 : 3 }}>{slide.title}</h2>

        {hasViews && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {views.map((v, i) => (
              <button
                key={v._key || i}
                onClick={() => switchView(i)}
                style={{
                  padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: activeView === i ? '#7c3aed' : 'transparent',
                  color: activeView === i ? '#fff' : '#64748b',
                  border: `1.5px solid ${activeView === i ? '#7c3aed' : 'var(--c-border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <p style={{ fontSize: 12, color: '#64748b' }}>
          {viewDescription}
          {hotspots.length > 0 && (
            <span style={{ marginLeft: 8, fontWeight: 600, color: viewed.size === hotspots.length ? '#059669' : '#94a3b8' }}>
              {viewed.size === hotspots.length ? 'All explored ✓' : `${viewed.size}/${hotspots.length} explored`}
            </span>
          )}
        </p>
      </div>

      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 16, overflow: 'hidden' }}
        onClick={e => { if (e.target === e.currentTarget) closeHotspot() }}
      >
        <div style={{
          position: 'relative', display: 'inline-block',
          transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
          transformOrigin: 'center center',
          transition: dragging ? 'none' : 'transform 0.12s ease',
        }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={slide.title}
              draggable={false}
              onClick={e => { if (!activeHotspot) return; e.stopPropagation(); closeHotspot() }}
              style={{
                display: 'block',
                maxWidth: 'calc(100vw - 128px)',
                maxHeight: 'calc(100vh - 240px)',
                width: 'auto', height: 'auto',
                borderRadius: 8, border: '1px solid #334155',
                boxShadow: '0 6px 40px rgba(0,0,0,0.3)', userSelect: 'none',
              }}
            />
          )}

          {hotspots.filter(h => h.areaW).map(h => (
            <div key={`area-${h._key}`} style={{
              position: 'absolute', left: `${h.areaX}%`, top: `${h.areaY}%`,
              width: `${h.areaW}%`, height: `${h.areaH}%`,
              border: `3px solid ${activeIdx !== null && hotspots[activeIdx]?._key === h._key ? '#facc15' : 'rgba(250,204,21,0.88)'}`,
              borderRadius: 6, pointerEvents: 'none', zIndex: 5, boxSizing: 'border-box',
              background: activeIdx !== null && hotspots[activeIdx]?._key === h._key ? 'rgba(250,204,21,0.13)' : 'rgba(250,204,21,0.07)',
              transition: 'all 0.2s',
            }} />
          ))}

          {hotspots.map((h, i) => {
            const key = h._key || String(i)
            const isActive = activeIdx === i
            const isViewed = viewed.has(key)
            return (
              <div key={key} style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%, -50%)', width: 26, height: 26, zIndex: isActive ? 60 : 10 }}>
                <button
                  onClick={e => { e.stopPropagation(); isActive ? closeHotspot() : openHotspot(i) }}
                  title={h.label}
                  className={!isActive && !isViewed ? 'pin-pulse' : ''}
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : isViewed ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#fde68a,#facc15)',
                    border: `2px solid ${isActive ? '#a78bfa' : isViewed ? '#6ee7b7' : '#a16207'}`,
                    boxShadow: isActive ? '0 0 0 3px rgba(124,58,237,0.3)' : '0 2px 6px rgba(0,0,0,0.35)',
                    color: isActive || isViewed ? '#fff' : '#1e293b',
                    fontWeight: 800, fontSize: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s', flexShrink: 0,
                  }}
                >
                  {isViewed && !isActive ? '✓' : i + 1}
                </button>

                {isActive && (
                  <div style={{
                    ...getPopupStyle(h),
                    background: '#fff', borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.22)', border: '1px solid #e2e8f0',
                    zIndex: 50, overflow: 'hidden', animation: 'panel-slide-in 0.15s ease forwards',
                  }}>
                    <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', lineHeight: 1.3 }}>{h.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <button onClick={e => { e.stopPropagation(); prevHotspot() }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13, fontWeight: 700 }}>‹</button>
                        <button onClick={e => { e.stopPropagation(); nextHotspot() }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13, fontWeight: 700 }}>›</button>
                        <button onClick={e => { e.stopPropagation(); closeHotspot() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', marginLeft: 2 }}><X size={13} /></button>
                      </div>
                    </div>
                    <div style={{ padding: '11px 14px 13px' }}>
                      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{h.description}</p>
                      <div style={{ marginTop: 9, fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>{i + 1} / {hotspots.length}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {scale === 1 && (
        <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', zIndex: 5 }}>
          <span style={{ fontSize: 11, color: '#64748b', background: 'rgba(15,23,42,0.6)', padding: '3px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
            Scroll to zoom in
          </span>
        </div>
      )}
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
  const [arrowHidden, setArrowHidden] = useState(false)
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
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setArrowHidden(false)
    setChecklistChecked([])
  }, [slideIndex])

  useEffect(() => {
    document.title = 'Welcome to Veras'
  }, [])

  function handleScrollArea(e) {
    const el = e.currentTarget
    const isScrollable = el.scrollHeight > el.clientHeight + 10
    if (isScrollable && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setArrowHidden(true)
    }
  }

  const goNext = useCallback(() => {
    if (!course) return
    if (slideIndex < course.slides.length - 1) setSlideIndex(i => i + 1)
  }, [slideIndex, course])

  const goPrev = useCallback(() => {
    if (slideIndex > 0) setSlideIndex(i => i - 1)
  }, [slideIndex])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  useEffect(() => {
    let accumulated = 0
    let cooldown = false
    function handleWheel(e) {
      if (cooldown) return
      accumulated += e.deltaY
      if (accumulated > 2000) {
        goNext(); accumulated = 0; cooldown = true
        setTimeout(() => { cooldown = false }, 2000)
      } else if (accumulated < -2000) {
        goPrev(); accumulated = 0; cooldown = true
        setTimeout(() => { cooldown = false }, 2000)
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
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
        @keyframes bounce-arrow {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(7px); opacity: 1; }
        }
        @keyframes fade-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
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
        <div ref={scrollRef} onScroll={handleScrollArea} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div key={slideIndex} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)', paddingBottom: 90, animation: 'slide-fade-in 0.22s ease forwards' }}>
            {renderSlide(slide, checklistChecked, i => setChecklistChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]))}
          </div>
        </div>

        {/* Slide sidebar */}
        <div style={{
          width: 48, background: '#1e293b', display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '20px 0', gap: 10, flexShrink: 0,
        }}>
          {course.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
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

      {/* Bottom: arrow or done state */}
      {!isLastSlide && !arrowHidden ? (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 48,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '8px 0 16px', gap: 6,
          background: 'linear-gradient(to bottom, transparent, var(--c-bg) 60%)',
          pointerEvents: 'none', zIndex: 10,
        }}>
          <div style={{ width: 80, height: 3, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: `linear-gradient(90deg, ${GRADIENT[0]}, ${GRADIENT[1]})`,
              width: `${((slideIndex + 1) / course.slides.length) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <button
            onClick={goNext}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pointerEvents: 'auto' }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', animation: 'fade-pulse 2s ease-in-out infinite' }}>
              {nudgeText}
            </span>
            <ChevronDown
              size={26}
              color={GRADIENT[0]}
              style={{ animation: 'bounce-arrow 1.4s ease-in-out infinite' }}
            />
          </button>
        </div>
      ) : null}
    </div>
  )
}
