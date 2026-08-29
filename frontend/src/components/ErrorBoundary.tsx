import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-8 text-center text-white">
          <div className="max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-8 shadow-2xl space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-2xl font-bold">
              🛡️
            </div>
            <h1 className="text-xl font-extrabold text-teal-400">Migrant Saathi AI</h1>
            <p className="text-sm text-slate-300">
              An unexpected runtime update occurred. Click below to refresh your portal access.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  window.location.href = '/select-role'
                }}
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 text-sm transition-all"
              >
                Go to Role Selection Portal →
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
