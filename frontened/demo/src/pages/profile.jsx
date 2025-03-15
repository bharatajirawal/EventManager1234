import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Edit, Trash2, Plus, Calendar, MapPin, DollarSign, Eye, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/users/events?organizer=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error("Failed to fetch events");
      }
    } catch (error) {
/*************  ✨ Codeium Command ⭐  *************/
  /**
   * Fetches events organized by the current user from the backend.
   * The events are fetched from the endpoint `http://localhost:8080/users/events?organizer=<username>`.
   * The response is expected to be a JSON array of event objects.
   * If the response is not ok, an error toast is displayed.
   * If the response is ok, the events are stored in the component state and the loading state is set to false.
   * If an error occurs while fetching the events, an error toast is displayed and the loading state is set to false.
   */
/******  6086632c-9d8e-4fb6-969a-1225c9333570  *******/      console.error("Error fetching events:", error);
      toast.error("Error loading events");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await fetch(`http://localhost:8080/users/events/${eventId}`, {
          method: "DELETE"
        });

        if (response.ok) {
          toast.success("Event deleted successfully");
          setEvents(events.filter(event => event._id !== eventId));
        } else {
          toast.error("Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Error deleting event");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              selectedTab === "profile" ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
            onClick={() => setSelectedTab("profile")}
          >
            User Profile
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              selectedTab === "events" ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
            onClick={() => setSelectedTab("events")}
          >
            My Events
          </button>
        </div>

        {selectedTab === "profile" ? (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mr-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Security</h3>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Logout Account
              </button>
              <p className="mt-2 text-sm text-gray-500">
                You'll be redirected to login page after logout
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedTab("events")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Manage My Events
              </button>
            </div>
          </div>
        ) : (
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
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="flex items-center text-gray-600 hover:text-blue-500"
                        >
                          <Eye size={16} className="mr-1" />
                          <span>View</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/edit-event/${event._id}`)}
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
        )}
      </div>
    </div>
  );
}