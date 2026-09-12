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
          <div className="max-w-md w-full rounded-2xl bg-slate-800 border border-slate-700 p-8 shadow-2xl space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-2xl font-bold">
              🛡️
            </div>
            <h1 className="text-xl font-extrabold text-teal-400">Migrant Saathi AI</h1>
            <p className="text-xs text-slate-300">
              A portal update or session reset occurred.
            </p>

            {this.state.error && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-left">
                <p className="text-[11px] font-mono text-red-300 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  window.location.reload()
                }}
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 text-sm transition-all"
              >
                Reload Application 🔄
              </button>
              <button
                onClick={() => {
                  window.location.href = '/select-role'
                }}
                className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 text-xs transition-all"
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
