import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0f172a', color: '#f1f5f9', textAlign: 'center',
          padding: 40, gap: 16,
        }}>
          <img src="/veras-logo.png" alt="Veras" style={{ height: 28, marginBottom: 8 }} />
          <div style={{ fontSize: 18, fontWeight: 700 }}>Something went wrong loading this slide.</div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>Try refreshing the page.</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8, padding: '10px 24px', borderRadius: 8,
              background: '#7c3aed', border: 'none', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
