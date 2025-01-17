import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h2 className="text-lg font-semibold mb-4">EventHub</h2>
            <p className="text-sm text-gray-600">
              Discover and create unforgettable experiences.
            </p>
          </div>
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-md font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-600 hover:text-orange-500">Home</Link></li>
              <li><Link to="/services" className="text-sm text-gray-600 hover:text-orange-500">Services</Link></li>
              <li><Link to="/login" className="text-sm text-gray-600 hover:text-orange-500">Login</Link></li>
              <li><Link to="/signup" className="text-sm text-gray-600 hover:text-orange-500">Sign Up</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-md font-semibold mb-4">Contact Us</h3>
            <p className="text-sm text-gray-600">
              Email: info@eventhub.com<br />
              Phone: (123) 456-7890
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © 2023 EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

