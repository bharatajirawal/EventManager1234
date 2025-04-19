"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Calendar, MapPin, DollarSign, User, Edit } from 'lucide-react'
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

export default function MyEventsPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8080/users/events/filtered?accessToken=${accessToken}`);

        if (response.ok) {
          const data = await response.json()
          console.log("User events:", data)
          setEvents(data)
        } else {
          toast.error("Failed to fetch your events")
          navigate("/events")
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        toast.error("Error loading your events")
        navigate("/events")
      } finally {
        setLoading(false)
      }
    }

    fetchUserEvents()
  }, [accessToken, navigate])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Function to correctly display image URLs from Cloudinary or fallback
  const getImageUrl = (eventImage) => {
    console.log(eventImage)
    if (!eventImage) {
      return "https://imgs.search.brave.com/SDmMp6QK8BpnygU8TIA6Gj8OpfrwxZ5xomIl51gjqhQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9keWwz/NDdoaXd2M2N0LmNs/b3VkZnJvbnQubmV0/L2FwcC91cGxvYWRz/LzIwMjUvMDMvNTMx/Mzk5Njk0MjRfNTg4/YzAyZmJkY19vLXNj/YWxlZC5qcGc"
    }

    // Check if the image URL is already a complete URL (Cloudinary)
    if (eventImage.startsWith("http")) {
      return eventImage
    }
    
    // If it's a local path, prepend the server URL
    return `http://localhost:8080${eventImage}`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Loading your events...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No Events Found</h3>
        <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
        <Link to="/events/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Your First Event
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link
          to="/events/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <div className="relative h-48">
              <img
                src={getImageUrl(event.eventImage) || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                  {event.type}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 truncate">
                {event.title}
              </h2>
              
              <div className="flex items-center text-gray-500 mb-2">
                <User size={16} className="mr-1" />
                <span className="text-sm truncate">{event.organizer}</span>
              </div>
              
              <div className="flex items-center text-gray-500 mb-2">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm">{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center text-gray-500 mb-3">
                <MapPin size={16} className="mr-1" />
                <span className="text-sm truncate">{event.location}</span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>
              
              <div className="flex justify-between items-center mt-4">
                <span className="font-medium">
                  {event.isFree ? "Free" : `$${event.price}`}
                </span>
                <div className="flex gap-2">
                  <Link
                    to={`/events/${event._id}`}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    View
                  </Link>
                  <Link
                    to={`/events/edit/${event._id}`}
                    className="text-green-500 hover:text-green-700 font-medium"
                  >
                    Edit
                  </Link>
                  

                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}