import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const sanityDevProxy = {
  name: 'sanity-api-proxy',
  configureServer(server) {
    server.middlewares.use('/api/intro', async (req, res) => {
      const query = encodeURIComponent(`
        *[_id == "course-intro"][0] {
          courseId, title,
          slides[] { ..., image { ..., "url": asset->url } }
        }
      `)
      const url = `https://nl3cliwe.api.sanity.io/v2024-01-01/data/query/production?query=${query}`
      const upstream = await fetch(url)
      const data = await upstream.json()
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    })
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sanityDevProxy],
})
