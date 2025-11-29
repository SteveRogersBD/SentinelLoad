export default function CyberGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 animate-grid-flow"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full opacity-30 font-mono text-xs text-neon-cyan/20 overflow-hidden">
        <div className="animate-scroll-code whitespace-pre">
{`[SYSTEM] Initializing security protocols...
[LOAD] Spawning worker threads: 256
[NETWORK] Establishing connections...
[METRICS] Real-time monitoring: ACTIVE
[SECURITY] Attack simulation: STANDBY
[API] Endpoint validation: READY
[LOAD] Request queue: EMPTY
[SYSTEM] All systems operational`}
        </div>
      </div>
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/3 rounded-full blur-3xl"></div>
    </div>
  )
}
