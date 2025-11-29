import { useState } from 'react'

interface ResponseData {
  status: number
  statusText: string
  responseTime: number
  size: number
  body: any
  headers: Record<string, string>
  error?: string
}

interface RequestPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onStartTest: () => void
  curlCommand: string
  response?: ResponseData
  isLoading: boolean
}

type ViewTab = 'pretty' | 'raw' | 'preview'

export default function RequestPreviewModal({
  isOpen,
  onClose,
  onStartTest,
  curlCommand,
  response,
  isLoading
}: RequestPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('pretty')

  if (!isOpen) return null

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-neon-green'
    if (status >= 400) return 'text-red-400'
    return 'text-yellow-400'
  }

  const formatJSON = (data: any) => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  const isHTML = (str: string) => {
    return /<\/?[a-z][\s\S]*>/i.test(str)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card-bg border-2 border-neon-cyan/40 rounded-lg shadow-2xl shadow-neon-cyan/20 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="bg-cyber-bg border-b border-neon-cyan/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-neon-green font-mono">root@sentinel:~$</span>
            <span className="text-neon-cyan font-mono font-bold">Request Preview</span>
            <span className="animate-pulse text-neon-cyan">▊</span>
          </div>
          <button
            onClick={onClose}
            className="text-soft-white/60 hover:text-red-400 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm">
          {/* CURL Command */}
          <div>
            <div className="text-neon-cyan mb-2 flex items-center">
              <span className="text-neon-green mr-2">$</span>
              Request as cURL
            </div>
            <div className="bg-cyber-bg border border-neon-cyan/30 rounded p-4 overflow-x-auto">
              <pre className="text-soft-white/90 text-xs whitespace-pre-wrap break-all">
                {curlCommand}
              </pre>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-pulse text-neon-cyan text-lg mb-2">
                ▊ Sending request...
              </div>
              <p className="text-soft-white/50 text-sm">Testing endpoint connectivity</p>
            </div>
          )}

          {/* Error State */}
          {response?.error && (
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded p-6">
              <div className="text-red-400 text-lg font-bold mb-2">
                ⚠ Request Failed
              </div>
              <div className="text-red-300 text-sm">
                {response.error}
              </div>
            </div>
          )}

          {/* Success Response */}
          {response && !response.error && (
            <>
              {/* Status Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-cyber-bg border border-neon-cyan/30 rounded p-4">
                  <div className="text-soft-white/60 text-xs mb-1">Status</div>
                  <div className={`text-3xl font-bold ${getStatusColor(response.status)}`}>
                    {response.status}
                  </div>
                  <div className="text-soft-white/70 text-xs mt-1">
                    {response.statusText}
                  </div>
                </div>
                <div className="bg-cyber-bg border border-neon-cyan/30 rounded p-4">
                  <div className="text-soft-white/60 text-xs mb-1">Response Time</div>
                  <div className="text-3xl font-bold text-neon-cyan">
                    {response.responseTime}
                  </div>
                  <div className="text-soft-white/70 text-xs mt-1">milliseconds</div>
                </div>
                <div className="bg-cyber-bg border border-neon-cyan/30 rounded p-4">
                  <div className="text-soft-white/60 text-xs mb-1">Size</div>
                  <div className="text-3xl font-bold text-neon-green">
                    {response.size}
                  </div>
                  <div className="text-soft-white/70 text-xs mt-1">KB</div>
                </div>
              </div>

              {/* Response Body */}
              <div>
                <div className="text-neon-cyan mb-2">Response Body</div>
                
                {/* Tabs */}
                <div className="flex space-x-1 mb-3">
                  <button
                    onClick={() => setActiveTab('pretty')}
                    className={`px-4 py-2 rounded-t transition-all ${
                      activeTab === 'pretty'
                        ? 'bg-cyber-bg text-neon-cyan border-t border-x border-neon-cyan/30'
                        : 'bg-cyber-bg/50 text-soft-white/60 hover:text-soft-white'
                    }`}
                  >
                    Pretty
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`px-4 py-2 rounded-t transition-all ${
                      activeTab === 'raw'
                        ? 'bg-cyber-bg text-neon-cyan border-t border-x border-neon-cyan/30'
                        : 'bg-cyber-bg/50 text-soft-white/60 hover:text-soft-white'
                    }`}
                  >
                    Raw
                  </button>
                  {typeof response.body === 'string' && isHTML(response.body) && (
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-4 py-2 rounded-t transition-all ${
                        activeTab === 'preview'
                          ? 'bg-cyber-bg text-neon-cyan border-t border-x border-neon-cyan/30'
                          : 'bg-cyber-bg/50 text-soft-white/60 hover:text-soft-white'
                      }`}
                    >
                      Preview
                    </button>
                  )}
                </div>

                <div className="bg-cyber-bg border border-neon-cyan/30 rounded p-4 max-h-96 overflow-auto">
                  {activeTab === 'pretty' && (
                    <pre className="text-soft-white/90 text-xs">
                      {response.body ? formatJSON(response.body) : (
                        <span className="text-soft-white/50 italic">No content returned</span>
                      )}
                    </pre>
                  )}
                  {activeTab === 'raw' && (
                    <pre className="text-soft-white/90 text-xs whitespace-pre-wrap break-all">
                      {typeof response.body === 'string' ? response.body : JSON.stringify(response.body)}
                    </pre>
                  )}
                  {activeTab === 'preview' && (
                    <iframe
                      srcDoc={String(response.body)}
                      sandbox="allow-same-origin"
                      className="w-full h-96 bg-white rounded"
                      title="HTML Preview"
                    />
                  )}
                </div>
              </div>

              {/* Response Headers */}
              <div>
                <div className="text-neon-cyan mb-2">Response Headers</div>
                <div className="bg-cyber-bg border border-neon-cyan/30 rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-cyber-bg border-b border-neon-cyan/30">
                      <tr>
                        <th className="text-left px-4 py-2 text-soft-white/60 font-normal">Header</th>
                        <th className="text-left px-4 py-2 text-soft-white/60 font-normal">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(response.headers).map(([key, value]) => (
                        <tr key={key} className="border-b border-neon-cyan/10 last:border-0">
                          <td className="px-4 py-2 text-neon-green">{key}</td>
                          <td className="px-4 py-2 text-soft-white/80">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {response && !isLoading && (
          <div className="bg-cyber-bg border-t border-neon-cyan/30 px-6 py-4">
            <p className="text-soft-white/70 text-sm mb-4 font-mono">
              Do you want to proceed with the load test?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onStartTest}
                className="flex-1 bg-neon-cyan text-cyber-bg font-bold font-mono py-3 px-6 rounded hover:bg-neon-cyan/90 transition-all shadow-lg shadow-neon-cyan/20"
              >
                START LOAD TEST
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-transparent border-2 border-soft-white/30 text-soft-white font-mono py-3 px-6 rounded hover:bg-soft-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
