import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <Zap className="w-6 h-6 text-primary-500" />
              <span className="gradient-text">ZipLogic AI</span>
            </Link>
            <p className="text-dark-400 max-w-md">
              Turn your ideas into complete, deployable software systems with AI-powered planning, memory, and accountability.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="text-dark-400 hover:text-white transition">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-dark-400 hover:text-white transition">Dashboard</Link></li>
              <li><a href="#" className="text-dark-400 hover:text-white transition">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-dark-400 hover:text-white transition">About</a></li>
              <li><a href="#" className="text-dark-400 hover:text-white transition">Contact</a></li>
              <li><a href="#" className="text-dark-400 hover:text-white transition">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-dark-700 mt-8 pt-8 text-center text-dark-400 text-sm">
          © {new Date().getFullYear()} ZipLogic AI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
