import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, DollarSign, Clock, User, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EventEditPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    date: "",
    time: "",
    location: "",
    isFree: false,
    price: "",
    organizer: "",
    eventImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://eventmanager1234-1.onrender.com/users/events/${id}?accessToken=${accessToken}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
          setFormData({
            title: data.title,
            description: data.description,
            type: data.type,
            date: data.date,
            time: data.time,
            location: data.location,
            isFree: data.isFree,
            price: data.price || "",
            organizer: data.organizer,
            eventImage: data.eventImage,
          });
          if (data.eventImage) {
            setImagePreview(`https://eventmanager1234-1.onrender.com/${data.eventImage}`);
          }
        } else {
          toast.error("Failed to fetch event");
          navigate("/my-events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Error loading event");
        navigate("/my-events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, accessToken, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date.toISOString().split('T')[0],
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        eventImage: file,
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("isFree", formData.isFree);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("organizer", formData.organizer);
      formDataToSend.append("accessToken", accessToken);
      
      if (formData.eventImage instanceof File) {
        formDataToSend.append("eventImage", formData.eventImage);
      }

      const response = await fetch(`https://eventmanager1234-1.onrender.com/users/events/${id}`, {
        method: "PATCH",
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success("Event updated successfully");
        navigate(`/events/${id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event");
    } finally {
      setSaving(false);
    }
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
        <button
          onClick={() => navigate("/my-events")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to My Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
              <option value="">Select event type</option>
            <option value="Music">Music</option>
            <option value="Nightlife">Nightlife</option>
            <option value="Business">Business</option>
            <option value="Performing Arts">Performing Arts</option>
            <option value="Food & Drink">Food & Drink</option>
            <option value="Holidays">Holidays</option>
            <option value="Dating">Dating</option>
            <option value="Hobbies">Hobbies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <DatePicker
                  selected={formData.date ? new Date(formData.date) : null}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    This is a free event
                  </span>
                </label>
              </div>

              {!formData.isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                      required={!formData.isFree}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organizer Name *
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-gray-200 rounded-md overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>No image</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 800x450px
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/events/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <X size={16} className="mr-1" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}