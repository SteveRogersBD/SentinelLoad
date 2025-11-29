import { useState, useEffect } from 'react'
import RequestPreviewModal from './RequestPreviewModal'

interface Header {
  id: string
  name: string
  value: string
}

interface Param {
  id: string
  key: string
  value: string
}

interface ResponseData {
  status: number
  statusText: string
  responseTime: number
  size: number
  body: any
  headers: Record<string, string>
  error?: string
}

type RequestTab = 'params' | 'headers' | 'auth' | 'body'

export default function RunTest() {
  const [targetUrl, setTargetUrl] = useState('')
  const [httpMethod, setHttpMethod] = useState('GET')
  const [activeTab, setActiveTab] = useState<RequestTab>('params')
  const [params, setParams] = useState<Param[]>([{ id: '1', key: '', value: '' }])
  const [headers, setHeaders] = useState<Header[]>([{ id: '1', name: '', value: '' }])
  const [authType, setAuthType] = useState('none')
  const [authToken, setAuthToken] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [startRps, setStartRps] = useState(10)
  const [maxRps, setMaxRps] = useState(100)
  const [duration, setDuration] = useState(60)
  const [attackPattern, setAttackPattern] = useState('sustained')
  const [workerCount, setWorkerCount] = useState(3)
  const [securityOptions, setSecurityOptions] = useState({
    endpointScanning: false,
    bruteForce: false,
    randomHeaders: false,
    errorInducing: false
  })
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [isLoadingRequest, setIsLoadingRequest] = useState(false)
  const [responseData, setResponseData] = useState<ResponseData | undefined>()

  const addParam = () => {
    setParams([...params, { id: Date.now().toString(), key: '', value: '' }])
  }

  const updateParam = (id: string, field: 'key' | 'value', value: string) => {
    setParams(params.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const removeParam = (id: string) => {
    if (params.length > 1) {
      setParams(params.filter(p => p.id !== id))
    }
  }

  const addHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), name: '', value: '' }])
  }

  const updateHeader = (id: string, field: 'name' | 'value', value: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h))
  }

  const removeHeader = (id: string) => {
    if (headers.length > 1) {
      setHeaders(headers.filter(h => h.id !== id))
    }
  }

  const buildCurlCommand = () => {
    let curl = `curl -X ${httpMethod}`
    
    // Add URL with params
    let url = targetUrl
    const activeParams = params.filter(p => p.key && p.value)
    if (activeParams.length > 0) {
      const queryString = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
      url += `?${queryString}`
    }
    curl += ` "${url}"`
    
    // Add headers
    const activeHeaders = headers.filter(h => h.name && h.value)
    activeHeaders.forEach(h => {
      curl += ` \\\n  -H "${h.name}: ${h.value}"`
    })
    
    // Add auth
    if (authType === 'bearer' && authToken) {
      curl += ` \\\n  -H "Authorization: Bearer ${authToken}"`
    } else if (authType === 'basic' && authUsername && authPassword) {
      curl += ` \\\n  -u "${authUsername}:${authPassword}"`
    }
    
    // Add body
    if (requestBody && httpMethod !== 'GET') {
      curl += ` \\\n  -d '${requestBody}'`
    }
    
    return curl
  }

  const sendTestRequest = async () => {
    setIsLoadingRequest(true)
    setResponseData(undefined)
    
    try {
      const startTime = performance.now()
      
      // Build URL with params
      let url = targetUrl
      const activeParams = params.filter(p => p.key && p.value)
      if (activeParams.length > 0) {
        const queryString = activeParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
        url += `?${queryString}`
      }
      
      // Build headers
      const requestHeaders: Record<string, string> = {}
      headers.filter(h => h.name && h.value).forEach(h => {
        requestHeaders[h.name] = h.value
      })
      
      // Add auth headers
      if (authType === 'bearer' && authToken) {
        requestHeaders['Authorization'] = `Bearer ${authToken}`
      } else if (authType === 'basic' && authUsername && authPassword) {
        requestHeaders['Authorization'] = `Basic ${btoa(`${authUsername}:${authPassword}`)}`
      }
      
      // Make request
      const response = await fetch(url, {
        method: httpMethod,
        headers: requestHeaders,
        body: httpMethod !== 'GET' && requestBody ? requestBody : undefined
      })
      
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      
      // Parse response
      const contentType = response.headers.get('content-type')
      let body
      const text = await response.text()
      
      if (contentType?.includes('application/json')) {
        try {
          body = JSON.parse(text)
        } catch {
          body = text
        }
      } else {
        body = text
      }
      
      // Get response headers
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      
      // Calculate size
      const size = new Blob([text]).size / 1024 // KB
      
      setResponseData({
        status: response.status,
        statusText: response.statusText,
        responseTime,
        size: Math.round(size * 100) / 100,
        body,
        headers: responseHeaders
      })
    } catch (error: any) {
      setResponseData({
        status: 0,
        statusText: 'Error',
        responseTime: 0,
        size: 0,
        body: null,
        headers: {},
        error: error.message || 'Failed to connect to the API'
      })
    } finally {
      setIsLoadingRequest(false)
    }
  }

  const handleStartTest = () => {
    if (!targetUrl) {
      alert('Please enter a target URL')
      return
    }
    
    setShowModal(true)
    sendTestRequest()
  }
  
  const handleConfirmLoadTest = () => {
    setShowModal(false)
    console.log('Starting load test with config:', {
      targetUrl,
      httpMethod,
      params,
      headers,
      authType,
      requestBody,
      startRps,
      maxRps,
      duration,
      attackPattern,
      workerCount,
      securityOptions
    })
    // Actual load test logic would go here
  }

  // Typing animation
  const [typedText, setTypedText] = useState('')
  const fullText = 'Configure and launch your API load test scenario'
  const [isDeleting, setIsDeleting] = useState(false)
  const typingSpeed = 50
  const deletingSpeed = 30
  const pauseTime = 2000

  useEffect(() => {
    let timeout: number

    if (!isDeleting && typedText === fullText) {
      timeout = window.setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && typedText === '') {
      setIsDeleting(false)
    } else {
      timeout = window.setTimeout(
        () => {
          setTypedText(
            isDeleting
              ? fullText.substring(0, typedText.length - 1)
              : fullText.substring(0, typedText.length + 1)
          )
        },
        isDeleting ? deletingSpeed : typingSpeed
      )
    }

    return () => clearTimeout(timeout)
  }, [typedText, isDeleting, fullText])

  return (
    <>
      <RequestPreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStartTest={handleConfirmLoadTest}
        curlCommand={buildCurlCommand()}
        response={responseData}
        isLoading={isLoadingRequest}
      />
      
      <div className="min-h-screen bg-cyber-bg text-soft-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-mono mb-2">
            <span className="text-neon-green">root@sentinel:~$</span>{' '}
            <span className="text-neon-cyan">./run_test</span>
          </h1>
          <p className="text-soft-white/70 font-mono text-sm min-h-[24px]">
            {typedText}
            <span className="animate-pulse text-neon-cyan">▊</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Request Builder (Postman-style) */}
          <div className="bg-card-bg rounded-lg border border-neon-cyan/20 shadow-lg shadow-neon-cyan/5 overflow-hidden">
            <div className="p-6 pb-4">
              <h2 className="text-xl font-bold font-mono mb-6 text-neon-cyan">
                Request Builder
              </h2>
              
              {/* Method + URL */}
              <div className="flex gap-3 mb-4">
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                  className="bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm font-bold focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/resource"
                  className="flex-1 bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-neon-cyan/20">
              <div className="flex px-6">
                <button
                  onClick={() => setActiveTab('params')}
                  className={`px-4 py-3 font-mono text-sm border-b-2 transition-all ${
                    activeTab === 'params'
                      ? 'border-neon-cyan text-neon-cyan'
                      : 'border-transparent text-soft-white/60 hover:text-soft-white'
                  }`}
                >
                  Params
                </button>
                <button
                  onClick={() => setActiveTab('headers')}
                  className={`px-4 py-3 font-mono text-sm border-b-2 transition-all ${
                    activeTab === 'headers'
                      ? 'border-neon-cyan text-neon-cyan'
                      : 'border-transparent text-soft-white/60 hover:text-soft-white'
                  }`}
                >
                  Headers
                </button>
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`px-4 py-3 font-mono text-sm border-b-2 transition-all ${
                    activeTab === 'auth'
                      ? 'border-neon-cyan text-neon-cyan'
                      : 'border-transparent text-soft-white/60 hover:text-soft-white'
                  }`}
                >
                  Auth
                </button>
                <button
                  onClick={() => setActiveTab('body')}
                  className={`px-4 py-3 font-mono text-sm border-b-2 transition-all ${
                    activeTab === 'body'
                      ? 'border-neon-cyan text-neon-cyan'
                      : 'border-transparent text-soft-white/60 hover:text-soft-white'
                  }`}
                >
                  Body
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[300px]">
              {/* Params Tab */}
              {activeTab === 'params' && (
                <div>
                  <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-mono text-soft-white/50 px-1">
                      <span>KEY</span>
                      <span>VALUE</span>
                      <span className="w-8"></span>
                    </div>
                    {params.map((param) => (
                      <div key={param.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                          placeholder="key"
                          className="bg-cyber-bg border border-neon-cyan/30 rounded px-3 py-2 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan transition-all"
                        />
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                          placeholder="value"
                          className="bg-cyber-bg border border-neon-cyan/30 rounded px-3 py-2 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan transition-all"
                        />
                        <button
                          onClick={() => removeParam(param.id)}
                          className="w-8 h-8 bg-cyber-bg border border-red-500/30 rounded text-red-400 hover:bg-red-500/10 transition-all text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addParam}
                    className="text-sm font-mono text-neon-green hover:text-neon-cyan transition-colors"
                  >
                    + Add Parameter
                  </button>
                </div>
              )}

              {/* Headers Tab */}
              {activeTab === 'headers' && (
                <div>
                  <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-mono text-soft-white/50 px-1">
                      <span>KEY</span>
                      <span>VALUE</span>
                      <span className="w-8"></span>
                    </div>
                    {headers.map((header) => (
                      <div key={header.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <input
                          type="text"
                          value={header.name}
                          onChange={(e) => updateHeader(header.id, 'name', e.target.value)}
                          placeholder="Content-Type"
                          className="bg-cyber-bg border border-neon-cyan/30 rounded px-3 py-2 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan transition-all"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                          placeholder="application/json"
                          className="bg-cyber-bg border border-neon-cyan/30 rounded px-3 py-2 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan transition-all"
                        />
                        <button
                          onClick={() => removeHeader(header.id)}
                          className="w-8 h-8 bg-cyber-bg border border-red-500/30 rounded text-red-400 hover:bg-red-500/10 transition-all text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addHeader}
                    className="text-sm font-mono text-neon-green hover:text-neon-cyan transition-colors"
                  >
                    + Add Header
                  </button>
                </div>
              )}

              {/* Auth Tab */}
              {activeTab === 'auth' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-mono mb-2 text-soft-white/90">
                      Auth Type
                    </label>
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value)}
                      className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="apikey">API Key</option>
                    </select>
                  </div>

                  {authType === 'bearer' && (
                    <div>
                      <label className="block text-sm font-mono mb-2 text-soft-white/90">
                        Token
                      </label>
                      <input
                        type="text"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="your-bearer-token"
                        className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                      />
                    </div>
                  )}

                  {authType === 'basic' && (
                    <>
                      <div>
                        <label className="block text-sm font-mono mb-2 text-soft-white/90">
                          Username
                        </label>
                        <input
                          type="text"
                          value={authUsername}
                          onChange={(e) => setAuthUsername(e.target.value)}
                          placeholder="username"
                          className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono mb-2 text-soft-white/90">
                          Password
                        </label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="password"
                          className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                        />
                      </div>
                    </>
                  )}

                  {authType === 'apikey' && (
                    <>
                      <div>
                        <label className="block text-sm font-mono mb-2 text-soft-white/90">
                          Key
                        </label>
                        <input
                          type="text"
                          placeholder="X-API-Key"
                          className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono mb-2 text-soft-white/90">
                          Value
                        </label>
                        <input
                          type="text"
                          placeholder="your-api-key"
                          className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                        />
                      </div>
                    </>
                  )}

                  {authType === 'none' && (
                    <p className="text-sm text-soft-white/50 font-mono">
                      No authentication will be used for this request.
                    </p>
                  )}
                </div>
              )}

              {/* Body Tab */}
              {activeTab === 'body' && (
                <div>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{\n  "key": "value",\n  "data": "example"\n}'
                    rows={10}
                    className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all resize-none"
                  />
                  <p className="mt-2 text-xs text-soft-white/50 font-mono">
                    {httpMethod === 'GET' ? 'Body is typically not used with GET requests' : 'Raw JSON body for the request'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Load Profile */}
          <div className="bg-card-bg rounded-lg p-6 border border-neon-cyan/20 shadow-lg shadow-neon-cyan/5">
            <h2 className="text-xl font-bold font-mono mb-6 text-neon-cyan">
              Load Profile
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-mono mb-2 text-soft-white/90">
                  Start RPS
                </label>
                <input
                  type="number"
                  value={startRps}
                  onChange={(e) => setStartRps(Number(e.target.value))}
                  min="1"
                  className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                />
                <p className="mt-1 text-xs text-soft-white/50 font-mono">
                  How many requests per second to begin with
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono mb-2 text-soft-white/90">
                  Max RPS
                </label>
                <input
                  type="number"
                  value={maxRps}
                  onChange={(e) => setMaxRps(Number(e.target.value))}
                  min="1"
                  className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                />
                <p className="mt-1 text-xs text-soft-white/50 font-mono">
                  Maximum requests per second at peak load
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono mb-2 text-soft-white/90">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                  className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                />
                <p className="mt-1 text-xs text-soft-white/50 font-mono">
                  Total time to run the load test
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono mb-2 text-soft-white/90">
                  Attack Pattern
                </label>
                <select
                  value={attackPattern}
                  onChange={(e) => setAttackPattern(e.target.value)}
                  className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                >
                  <option value="sustained">Sustained</option>
                  <option value="burst">Burst</option>
                  <option value="spike">Spike</option>
                  <option value="ramp-up">Ramp-up</option>
                  <option value="random">Random</option>
                </select>
                <p className="mt-1 text-xs text-soft-white/50 font-mono">
                  How traffic intensity changes over time
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Security Simulation Options */}
          <div className="bg-card-bg rounded-lg p-6 border border-neon-cyan/20 shadow-lg shadow-neon-cyan/5">
            <h2 className="text-xl font-bold font-mono mb-6 text-neon-cyan">
              Security Behavior
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={securityOptions.endpointScanning}
                  onChange={(e) => setSecurityOptions({...securityOptions, endpointScanning: e.target.checked})}
                  className="mt-1 w-4 h-4 bg-cyber-bg border-neon-cyan/30 rounded text-neon-cyan focus:ring-neon-cyan focus:ring-offset-0"
                />
                <div>
                  <div className="text-sm font-mono text-soft-white group-hover:text-neon-cyan transition-colors">
                    Simulate endpoint scanning
                  </div>
                  <div className="text-xs text-soft-white/50 font-mono mt-0.5">
                    Hit many different paths to test API discovery defenses
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={securityOptions.bruteForce}
                  onChange={(e) => setSecurityOptions({...securityOptions, bruteForce: e.target.checked})}
                  className="mt-1 w-4 h-4 bg-cyber-bg border-neon-cyan/30 rounded text-neon-cyan focus:ring-neon-cyan focus:ring-offset-0"
                />
                <div>
                  <div className="text-sm font-mono text-soft-white group-hover:text-neon-cyan transition-colors">
                    Simulate brute-force behavior
                  </div>
                  <div className="text-xs text-soft-white/50 font-mono mt-0.5">
                    Repeat same request many times to test rate limiting
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={securityOptions.randomHeaders}
                  onChange={(e) => setSecurityOptions({...securityOptions, randomHeaders: e.target.checked})}
                  className="mt-1 w-4 h-4 bg-cyber-bg border-neon-cyan/30 rounded text-neon-cyan focus:ring-neon-cyan focus:ring-offset-0"
                />
                <div>
                  <div className="text-sm font-mono text-soft-white group-hover:text-neon-cyan transition-colors">
                    Simulate bot-like random headers
                  </div>
                  <div className="text-xs text-soft-white/50 font-mono mt-0.5">
                    Vary user-agents and headers to mimic bot traffic
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={securityOptions.errorInducing}
                  onChange={(e) => setSecurityOptions({...securityOptions, errorInducing: e.target.checked})}
                  className="mt-1 w-4 h-4 bg-cyber-bg border-neon-cyan/30 rounded text-neon-cyan focus:ring-offset-0"
                />
                <div>
                  <div className="text-sm font-mono text-soft-white group-hover:text-neon-cyan transition-colors">
                    Send error-inducing requests
                  </div>
                  <div className="text-xs text-soft-white/50 font-mono mt-0.5">
                    Include malformed data to test error handling
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Card 4: Workers & Controls */}
          <div className="bg-card-bg rounded-lg p-6 border border-neon-cyan/20 shadow-lg shadow-neon-cyan/5">
            <h2 className="text-xl font-bold font-mono mb-6 text-neon-cyan">
              Worker Nodes
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-mono mb-2 text-soft-white/90">
                  Worker Count
                </label>
                <input
                  type="number"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Number(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full bg-cyber-bg border border-neon-cyan/30 rounded px-4 py-2.5 text-soft-white font-mono text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
                />
                <p className="mt-1 text-xs text-soft-white/50 font-mono">
                  Workers act like mini legal botnet nodes generating distributed traffic
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleStartTest}
                  className="w-full bg-neon-cyan text-cyber-bg font-bold font-mono py-3.5 px-6 rounded hover:bg-neon-cyan/90 transition-all shadow-lg shadow-neon-cyan/20 hover:shadow-neon-cyan/40"
                >
                  START LOAD TEST
                </button>
                
                <button
                  disabled
                  className="w-full text-soft-white/30 font-mono text-sm py-2 hover:text-soft-white/50 transition-colors cursor-not-allowed"
                >
                  view live dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
