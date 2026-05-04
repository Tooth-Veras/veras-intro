export default async function handler(req, res) {
  const query = encodeURIComponent(`
    *[_id == "course-intro"][0] {
      courseId, title,
      slides[] { ..., image { ..., "url": asset->url } }
    }
  `)

  const url = `https://nl3cliwe.api.sanity.io/v2024-01-01/data/query/production?query=${query}`

  const sanityRes = await fetch(url)
  if (!sanityRes.ok) {
    return res.status(502).json({ error: 'Upstream fetch failed' })
  }

  const data = await sanityRes.json()
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  res.json(data)
}
