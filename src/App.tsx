import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import CyberGrid from './components/CyberGrid'

function App() {
  return (
    <div className="relative min-h-screen bg-cyber-bg text-soft-white overflow-hidden">
      <CyberGrid />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
      </div>
    </div>
  )
}

export default App
