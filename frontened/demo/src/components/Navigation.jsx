import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Button from './ui/Button'

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold text-orange-500">
          EventHub
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/services" className="text-sm font-medium">
            Services
          </Link>
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button>Sign up</Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <button className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </nav>
    </header>
  )
}

