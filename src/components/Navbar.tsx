export default function Navbar() {
  return (
    <nav className="border-b border-neon-cyan/30 backdrop-blur-sm font-mono">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-neon-green">root@sentinel:~$</span>
            <span className="text-neon-cyan font-bold">SentinelLoad</span>
            <span className="animate-pulse text-neon-cyan">▊</span>
          </div>
          
          <div className="hidden md:flex space-x-6 text-sm">
            <a href="#" className="text-soft-white hover:text-neon-cyan transition-colors">
              <span className="text-neon-green">./</span>home
            </a>
            <a href="#" className="text-soft-white hover:text-neon-cyan transition-colors">
              <span className="text-neon-green">./</span>run_test
            </a>
            <a href="#" className="text-soft-white hover:text-neon-cyan transition-colors">
              <span className="text-neon-green">./</span>dashboard
            </a>
            <a href="#" className="text-soft-white hover:text-neon-cyan transition-colors">
              <span className="text-neon-green">./</span>docs
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
