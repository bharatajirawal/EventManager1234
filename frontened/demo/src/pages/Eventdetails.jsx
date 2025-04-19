import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, MapPin, DollarSign, Clock, User, Edit } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function EventViewPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Fetches event details from the server for the given event ID.
 * Utilizes the access token for authorization. On a successful
 * response, updates the event state and determines if the user 
 * is the organizer. Displays error notifications and redirects 

/*******  e94a53c9-3ccb-44dd-8795-d888cbe9f18e  *******/
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://eventmanager1234-1.onrender.com/users/events/${id}?accessToken=${accessToken}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log("Event details:", data);
          setEvent(data);
          setIsOrganizer(data.isOrganizer || false);
        } else {
          toast.error("Failed to fetch event");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Error loading event");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, accessToken, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Event Not Found</h3>
        <p className="text-gray-500 mb-4">The requested event does not exist.</p>
        <Link
          to="/"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
        <img
  src={
    event.eventImage

      ? event.eventImage.startsWith('http') 
        ? event.eventImage  // Already a full URL (Cloudinary)
        : `https://eventmanager1234-1.onrender.com/${event.eventImage}`  // Local path
      : "https://imgs.search.brave.com/SDmMp6QK8BpnygU8TIA6Gj8OpfrwxZ5xomIl51gjqhQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9keWwz/NDdoaXd2M2N0LmNs/b3VkZnJvbnQubmV0/L2FwcC91cGxvYWRz/LzIwMjUvMDMvNTMx/Mzk5Njk0MjRfNTg4/YzAyZmJkY19vLXNj/YWxlZC5qcGc"  // Fallback
  }
  alt={event.title}
  className="w-full h-96 object-cover"
/>
          {isOrganizer && (
            <button
              onClick={() => navigate(`/events/edit/${id}`)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-md shadow-sm flex items-center"
            >
              <Edit size={16} className="mr-1" />
              Edit Event
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <User size={16} className="mr-1" />
                <span>Organized by {event.organizer}</span>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              {event.type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar size={18} className="mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p>{formatDate(event.date)} at {event.time}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign size={18} className="mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Price</p>
                    <p>{event.isFree ? "Free" : `$${event.price}`}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">About the Event</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}