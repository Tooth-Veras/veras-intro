const TYPE_MAP = {
  coverSlide: 'cover',
  textImageSlide: 'text_image',
  featureCardsSlide: 'feature_cards',
  stepsSlide: 'steps',
  statementSlide: 'statement',
  phonesSlide: 'phones',
  hotspotSlide: 'hotspot',
  checklistSlide: 'checklist',
  badgeSlide: 'badge',
}

function transformSlide(slide) {
  return {
    ...slide,
    type: TYPE_MAP[slide._type] || slide._type,
    imageUrl: slide.image?.url || slide.imageUrl || null,
  }
}

export async function fetchIntroCourse() {
  const res = await fetch('/api/intro')
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const { result } = await res.json()
  if (!result) throw new Error('Intro course not found')
  return {
    id: result.courseId,
    title: result.title,
    slides: (result.slides || []).map(transformSlide),
  }
}
