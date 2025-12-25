import React from 'react'
import Card from '../ui/Card'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps){
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any){
    console.error('ErrorBoundary caught error:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render(){
    if (this.state.hasError){
      return (
        <div className="container section">
          <Card>
            <h2>Something went wrong</h2>
            <p>Please try again. If the issue persists, contact support.</p>
            <pre style={{whiteSpace:'pre-wrap'}}>{this.state.error?.message}</pre>
            <button className="button" onClick={this.handleRetry}>Try again</button>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
