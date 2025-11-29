import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path
  
  return (
    <nav className="border-b border-neon-cyan/30 backdrop-blur-sm font-mono">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-neon-green">root@sentinel:~$</span>
            <span className="text-neon-cyan font-bold">SentinelLoad</span>
            <span className="animate-pulse text-neon-cyan">▊</span>
          </Link>
          
          <div className="hidden md:flex space-x-6 text-sm">
            <Link 
              to="/" 
              className={`transition-colors ${
                isActive('/') 
                  ? 'text-neon-cyan' 
                  : 'text-soft-white hover:text-neon-cyan'
              }`}
            >
              <span className="text-neon-green">./</span>home
            </Link>
            <Link 
              to="/run-test" 
              className={`transition-colors ${
                isActive('/run-test') 
                  ? 'text-neon-cyan' 
                  : 'text-soft-white hover:text-neon-cyan'
              }`}
            >
              <span className="text-neon-green">./</span>run_test
            </Link>
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
