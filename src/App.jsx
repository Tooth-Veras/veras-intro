import { ThemeProvider } from './contexts/ThemeContext'
import IntroPage from './pages/IntroPage'

export default function App() {
  return (
    <ThemeProvider>
      <IntroPage />
    </ThemeProvider>
  )
}
