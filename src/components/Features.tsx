export default function Features() {
  const features = [
    {
      command: 'load-gen',
      title: 'High-Volume Load Generation',
      output: '> Generating 100K req/s\n> Status: ACTIVE\n> Threads: 256'
    },
    {
      command: 'attack-sim',
      title: 'Security Attack Pattern Simulation',
      output: '> DDoS simulation: ON\n> Rate-limit bypass: TESTING\n> Injection patterns: ACTIVE'
    },
    {
      command: 'metrics',
      title: 'Real-Time Metrics & Dashboard',
      output: '> Response time: 45ms\n> Error rate: 0.02%\n> Throughput: 98.7K/s'
    }
  ]

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-8 font-mono">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group relative p-6 bg-cyber-bg border border-neon-cyan/30 hover:border-neon-cyan transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]"
          >
            <div className="mb-4">
              <span className="text-neon-green">root@sentinel:~$</span>
              <span className="text-soft-white ml-2">./{feature.command}</span>
            </div>
            
            <h3 className="text-lg font-bold mb-4 text-neon-cyan border-b border-neon-cyan/20 pb-2">
              [{feature.title}]
            </h3>
            
            <pre className="text-sm text-soft-white/80 leading-relaxed whitespace-pre-wrap">
              {feature.output}
            </pre>
            
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-xs text-neon-green">RUNNING</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
