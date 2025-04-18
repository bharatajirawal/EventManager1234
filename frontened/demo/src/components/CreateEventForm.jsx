import { useState, useRef,useContext} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Upload, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function UpdateMapView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export default function CreateEventForm() {
  const { user,accessToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    organizer: "",
    type: "",
    isFree: true,
    price: "",
    latitude: "",
    longitude: "",
    email:user.email,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMapClick = async (e) => {
    e.preventDefault();
    
    if (!formData.location) {
      toast.error('Please enter a location first');
      return;
    }

    // If coordinates are not set, geocode the address
    if (!formData.latitude || !formData.longitude) {
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`
        );
        const data = await response.json();
        if (data.length > 0) {
          const firstResult = data[0];
          setFormData(prev => ({
            ...prev,
            latitude: firstResult.lat,
            longitude: firstResult.lon
          }));
          toast.success('Location found on map');
        } else {
          toast.error('Location not found');
          return;
        }
      } catch (error) {
        toast.error('Error geocoding address');
        return;
      } finally {
        setIsGeocoding(false);
      }
    }

    setShowMap(!showMap);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create a FormData object to handle file upload
      const eventFormData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        eventFormData.append(key, formData[key]);
      });
      eventFormData.append("accessToken",accessToken)
      
      // Add image file if available
      if (imageFile) {
        eventFormData.append("eventImage", imageFile);
      }
      
      const response = await fetch("http://localhost:8080/users/events", {
        method: "POST",
        body: eventFormData,
      });
      
      if (response.ok) {
        const createdEvent = await response.json();
        toast.success("Event created successfully!");
        navigate(`/events/${createdEvent._id}`);
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          organizer: "",
          type: "",
          isFree: true,
          price: "",
          latitude: "",
          longitude: "",
          email:"",
        });
        setImagePreview(null);
        setImageFile(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("An error occurred while creating the event");
    }
  };

  const center = formData.latitude && formData.longitude 
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
    : [0, 0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>
      
      {/* Event Image Upload */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Event Image</label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          {imagePreview ? (
            <div className="relative w-full">
              <img 
                src={imagePreview} 
                alt="Event preview" 
                className="w-full h-48 object-cover rounded"
              />
              <button 
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">Upload an image for your event</p>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Select Image
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium">
            Event Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter event title"
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block mb-1 font-medium">
            Event Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select event type</option>
            <option value="Music">Music</option>
            <option value="Arts">Arts</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
            <option value="Food">Food</option>
            <option value="Technology">Technology</option>
            <option value="Education">Education</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your event"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block mb-1 font-medium">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block mb-1 font-medium">
            Time
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block mb-1 font-medium">
          Location
        </label>
        <div className="flex">
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-l focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter venue address"
          />
          <button
            type="button"
            onClick={handleMapClick}
            disabled={isGeocoding}
            className="bg-green-500 text-white px-3 py-2 rounded-r hover:bg-green-600 disabled:bg-green-300"
          >
            {isGeocoding ? 'Searching...' : <MapPin size={20} />}
          </button>
        </div>
      </div>
      
      {showMap && (
        <div className="border rounded p-2">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Set Exact Location (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block mb-1 text-sm">Latitude</label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block mb-1 text-sm">Longitude</label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>
          </div>
          
          <div className="h-64 bg-gray-100 rounded">
            {formData.latitude && formData.longitude ? (
              <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} />
                <UpdateMapView center={center} />
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Enter a location to see map</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Note: Map data © OpenStreetMap contributors
          </p>
        </div>
      )}

      <div>
        <label htmlFor="organizer" className="block mb-1 font-medium">
          Organizer
        </label>
        <input
          type="text"
          id="organizer"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Who is organizing this event?"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isFree"
            checked={formData.isFree}
            onChange={handleChange}
            className="mr-2 h-4 w-4"
          />
          <span className="font-medium">Free Event</span>
        </label>
      </div>
      
      {!formData.isFree && (
        <div>
          <label htmlFor="price" className="block mb-1 font-medium">
            Price
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full pl-7 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
      )}
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium"
      >
        Create Event
      </button>
    </form>
  );
}