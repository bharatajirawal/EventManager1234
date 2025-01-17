import { Search, MapPin } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Home() {
  const categories = [
    { icon: '🎵', label: 'Music' },
    { icon: '🌙', label: 'Nightlife' },
    { icon: '🎭', label: 'Performing Arts' },
    { icon: '🎉', label: 'Holidays' },
    { icon: '❤️', label: 'Dating' },
    { icon: '🎮', label: 'Hobbies' },
    { icon: '💼', label: 'Business' },
    { icon: '🍽️', label: 'Food & Drink' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Find your next unforgettable experience
          </h1>
          <p className="text-xl mb-8">
            Discover events that match your passions
          </p>
          <Button variant="ghost" className="bg-white text-orange-500 hover:bg-gray-100">
            Explore Events
          </Button>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input type="search" placeholder="Search events" className="pl-10" />
            </div>
            <div className="w-full md:w-1/3 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="Choose a location" className="pl-10" />
            </div>
            <Button>Search</Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <div key={category.label} className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-center">{category.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

