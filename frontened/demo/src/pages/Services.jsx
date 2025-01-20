export default function Services() {
  const services = [
    { title: "Event Planning", description: "Professional event planning services for all types of events." },
    { title: "Venue Booking", description: "Find and book the perfect venue for your event." },
    { title: "Ticketing", description: "Easy-to-use ticketing system for your events." },
    { title: "Marketing", description: "Promote your event to reach a wider audience." },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}