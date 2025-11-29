import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import CyberGrid from './components/CyberGrid'
import RunTest from './components/RunTest'

function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-cyber-bg text-soft-white overflow-hidden">
        <CyberGrid />
        <div className="relative z-10">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/run-test" element={<RunTest />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
