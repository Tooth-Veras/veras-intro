import { ThemeProvider } from './contexts/ThemeContext'
import IntroPage from './pages/IntroPage'
import ErrorBoundary from './ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <IntroPage />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
