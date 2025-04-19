import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, Calendar, MapPin, DollarSign, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function MyEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const {accessToken}=useAuth()
  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      // Use the organizer parameter to match the backend
      const response=await fetch(`http://localhost:8080/users/events/filtered?accessToken=${accessToken}`);
    
      
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setEvents(data);
      } else {
        toast.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Error loading events");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(
          `http://localhost:8080/users/events/${eventId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (response.ok) {
          toast.success("Event deleted successfully");
          setEvents(events.filter((event) => event._id !== eventId));
        } else {
          const errorData = await response.json();
          toast.error(`Failed to delete event: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Error deleting event");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Events</h2>
        <Link
          to="/create-event"
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus size={18} className="mr-1" />
          Create New Event
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Events Found</h3>
          <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
          <Link
            to="/create-event"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {event.eventImage ? (
                <img
                  src={`http://localhost:8080${event.eventImage}`}
                  alt={event.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://imgs.search.brave.com/SDmMp6QK8BpnygU8TIA6Gj8OpfrwxZ5xomIl51gjqhQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9keWwz/NDdoaXd2M2N0LmNs/b3VkZnJvbnQubmV0/L2FwcC91cGxvYWRz/LzIwMjUvMDMvNTMx/Mzk5Njk0MjRfNTg4/YzAyZmJkY19vLXNj/YWxlZC5qcGc";
                  }}
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  <Calendar size={36} className="text-gray-400" />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg truncate">{event.title}</h3>
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                    {event.type}
                  </span>
                </div>
                
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(event.date)}</span>
                  <span className="mx-1">•</span>
                  <span>{event.time}</span>
                </div>
                
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <MapPin size={14} className="mr-1" />
                  <span className="truncate">{event.location}</span>
                </div>
                
                <div className="flex items-center mt-1 text-sm">
                  <DollarSign size={14} className="mr-1" />
                  <span>{event.isFree ? 'Free' : `$${event.price}`}</span>
                </div>
                
                <div className="border-t mt-4 pt-4 flex justify-between">
                <button
  onClick={() => navigate(`/events/${event._id}`)}  // View event page
  className="flex items-center text-gray-600 hover:text-blue-500"
>
  <Eye size={16} className="mr-1" />
  <span>View</span>
</button>

<button
  onClick={() => navigate(`/events/edit/${event._id}`)}  // Edit event page
  className="flex items-center text-gray-600 hover:text-green-500"
>
  <Edit size={16} className="mr-1" />
  <span>Edit</span>
</button>
                  
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="flex items-center text-gray-600 hover:text-red-500"
                  >
                    <Trash2 size={16} className="mr-1" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}