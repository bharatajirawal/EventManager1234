import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"

export default function EventDetails() {
  const [event, setEvent] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://localhost:8080/users/${id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      } else {
        toast.error("Failed to fetch event details")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred while fetching event details")
    }
  }

  if (!event) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-600 mb-4">
        {event.date} at {event.time}
      </p>
      <p className="text-gray-600 mb-4">{event.location}</p>
      <p className="mb-4">{event.description}</p>
      <p className="mb-4">Organizer: {event.organizer}</p>
      <p className="mb-4">Event Type: {event.type}</p>
      <p className="font-bold">{event.isFree ? "Free Event" : `Price: $${event.price}`}</p>
    </div>
  )
}

