import Button from '../components/ui/Button'

export default function Services() {
  const services = [
    {
      title: 'Event Planning',
      description: 'Professional event planning services for all types of events.',
      icon: '📅',
    },
    {
      title: 'Venue Booking',
      description: 'Find and book the perfect venue for your event.',
      icon: '🏢',
    },
    {
      title: 'Catering Services',
      description: 'Delicious food and beverage options for your guests.',
      icon: '🍽️',
    },
    {
      title: 'Entertainment Booking',
      description: 'Book top-notch entertainment for your event.',
      icon: '🎭',
    },
  ]

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div key={service.title} className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Button variant="ghost" className="w-full">Learn More</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

