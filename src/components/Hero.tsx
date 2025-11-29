import { useState, useEffect } from 'react'

export default function Hero() {
  const [typedText, setTypedText] = useState('')
  const fullText = 'API Resilience & Security Load Tester\nSimulate high-load, spikes, bursts, and attack-patterns\nTest API stability and security under extreme conditions'
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const typingSpeed = 50
  const deletingSpeed = 30
  const pauseTime = 2000

  useEffect(() => {
    let timeout: number

    if (!isDeleting && typedText === fullText) {
      timeout = window.setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && typedText === '') {
      setIsDeleting(false)
      setLoopNum(loopNum + 1)
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
  }, [typedText, isDeleting, loopNum, fullText])

  const lines = typedText.split('\n')

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="font-mono">
        <div className="mb-8">
          <span className="text-neon-green">root@sentinel:~$</span>
          <span className="text-soft-white ml-2">./sentinelload --init</span>
        </div>
        
        <div className="mb-4">
          <span className="text-neon-cyan">[INFO]</span>
          <span className="text-soft-white ml-2">Initializing SentinelLoad v2.4.1...</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-neon-cyan">
          &gt; SentinelLoad_
        </h1>
        
        <div className="space-y-2 mb-8 text-soft-white/90 min-h-[120px]">
          {lines[0] && (
            <p className="text-lg md:text-xl">
              <span className="text-neon-green">==&gt;</span> {lines[0]}
            </p>
          )}
          {lines[1] !== undefined && (
            <p className="text-base md:text-lg text-soft-white/70">
              <span className="text-neon-cyan">│</span> {lines[1]}
            </p>
          )}
          {lines[2] !== undefined && (
            <p className="text-base md:text-lg text-soft-white/70">
              <span className="text-neon-cyan">│</span> {lines[2]}
            </p>
          )}
          <span className="animate-pulse text-neon-cyan">▊</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-neon-green">$</span>
          <button className="group relative px-8 py-3 bg-transparent border-2 border-neon-cyan text-neon-cyan font-bold text-lg hover:bg-neon-cyan hover:text-cyber-bg transition-all">
            <span className="relative z-10">./start_testing.sh</span>
          </button>
          <span className="animate-pulse text-neon-cyan text-2xl">▊</span>
        </div>
      </div>
    </section>
  )
}
