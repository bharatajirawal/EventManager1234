"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Menu, X, User, Calendar, Home, Briefcase, LogIn, UserPlus } from "lucide-react"

export default function Navigation() {
  const { user, isLoggedIn } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Debug what's in the user object
  console.log("Navigation user:", user)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span>EventHUB</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-6">
            <li>
              <Link to="/" className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/create-event" className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                <Calendar className="h-4 w-4" />
                <span>Create Event</span>
              </Link>
            </li>
            <li>
              <Link to="/services" className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                <Briefcase className="h-4 w-4" />
                <span>Services</span>
              </Link>
            </li>
            {isLoggedIn ? (
              <li>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.email || "Profile"}</span>
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" className="flex items-center space-x-1 hover:text-blue-200 transition-colors">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="flex items-center space-x-1 bg-white text-purple-600 px-4 py-2 rounded-full font-medium hover:bg-blue-100 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Signup</span>
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 pb-6 animate-fadeIn">
            <ul className="flex flex-col space-y-4">
              <li>
                <Link
                  to="/"
                  className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/create-event"
                  className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Create Event</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Services</span>
                </Link>
              </li>
              {isLoggedIn ? (
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.email || "Profile"}</span>
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="flex items-center space-x-2 p-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>Signup</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
