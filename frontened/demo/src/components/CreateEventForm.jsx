import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Upload, X, RefreshCw } from "lucide-react";
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

// New component to handle map clicks
function LocationMarker({ setCoordinates }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoordinates(lat, lng);
    },
  });
  return null;
}

// Enhanced image validation function
const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const maxDimension = 4096; // Max width/height
  
  // Check file type
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Invalid file type. Please select JPEG, PNG, GIF, or WEBP image.' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` };
  }
  
  // Check if file is corrupted by trying to read it
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      try {
        // Check dimensions
        if (img.width > maxDimension || img.height > maxDimension) {
          resolve({ valid: false, error: `Image dimensions too large. Maximum ${maxDimension}x${maxDimension}px.` });
          return;
        }
        
        // Test if image can be drawn (not corrupted)
        canvas.width = Math.min(img.width, 100);
        canvas.height = Math.min(img.height, 100);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve({ valid: true, width: img.width, height: img.height });
      } catch (error) {
        resolve({ valid: false, error: 'Image appears to be corrupted or invalid.' });
      }
    };
    
    img.onerror = () => {
      resolve({ valid: false, error: 'Failed to load image. File may be corrupted.' });
    };
    
    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Clean up object URL after a timeout
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 5000);
  });
};

// Image compression function
const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a new File object with compressed data
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Return original if compression fails
        }
      }, file.type, quality);
    };
    
    img.onerror = () => {
      resolve(file); // Return original if loading fails
    };
    
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 5000);
  });
};

export default function CreateEventForm() {
  const { user, accessToken } = useContext(AuthContext);
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
    email: user.email,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [lastSearched, setLastSearched] = useState(""); // Track last searched location
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Reset coordinates if location input changes
    if (name === "location" && value !== lastSearched) {
      setFormData(prev => ({
        ...prev,
        latitude: "",
        longitude: ""
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingImage(true);
    
    try {
      // First, validate the image
      const validation = await validateImage(file);
      
      if (!validation.valid) {
        toast.error(validation.error);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      console.log(`Image validation passed: ${validation.width}x${validation.height}px`);
      
      // Compress image if it's too large
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) { // If larger than 2MB, compress
        toast.info('Compressing large image...');
        processedFile = await compressImage(file);
        console.log(`Image compressed: ${file.size} -> ${processedFile.size} bytes`);
      }
      
      setImageFile(processedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(processedFile);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error processing image. Please try a different file.');
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsProcessingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetLocation = () => {
    setFormData(prev => ({
      ...prev,
      latitude: "",
      longitude: "",
      location: ""
    }));
    setLastSearched("");
    toast.success("Location data cleared");
  };

  const handleMapClick = async (e) => {
    e.preventDefault();
    
    if (!formData.location && !showMap) {
      toast.error('Please enter a location first');
      return;
    }

    // Clear previous search data if the location has changed
    if (formData.location !== lastSearched) {
      setFormData(prev => ({
        ...prev,
        latitude: "",
        longitude: ""
      }));
    }

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
          setLastSearched(formData.location); // Update last searched location
          toast.success('Location found on map');
        } else {
          toast.error('Location not found');
          // Show map anyway with default location if not found
          setShowMap(!showMap);
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

  // New function to update coordinates when map is clicked
  const setCoordinates = async (lat, lng) => {
    // Update form data with new coordinates
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));

    // Optional: Reverse geocode to get address
    try {
      setIsReverseGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          location: data.display_name
        }));
        setLastSearched(data.display_name); // Update last searched location
        toast.success('Location updated');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      toast.error('Could not get address for this location');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const eventFormData = new FormData();
      
      // Convert all form data to strings and append
      Object.entries(formData).forEach(([key, value]) => {
        eventFormData.append(key, String(value));
      });
      
      eventFormData.append("accessToken", accessToken);
      
      if (imageFile) {
        // Log image details for debugging
        console.log('Uploading image:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        eventFormData.append("eventImage", imageFile);
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch("https://eventmanager1234-1.onrender.com/users/events", {
        method: "POST",
        body: eventFormData,
        signal: controller.signal,
        credentials: 'include'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

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
        email: user.email,
      });
      setImagePreview(null);
      setImageFile(null);
      setLastSearched("");
    } catch (error) {
      console.error("Error creating event:", error);
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error(error.message || "An error occurred while creating the event");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const center = formData.latitude && formData.longitude 
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
    : [51.505, -0.09]; // Default center (London)

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
              {imageFile && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {imageFile.name} ({(imageFile.size / 1024).toFixed(1)}KB)
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">
                Upload an image for your event (JPEG, PNG, GIF, WEBP)
              </p>
              <p className="text-xs text-gray-400">Max file size: 5MB • Max dimensions: 4096x4096px</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isProcessingImage ? 'Processing...' : 'Select Image'}
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            disabled={isProcessingImage}
            className="hidden"
          />
        </div>
        {isProcessingImage && (
          <p className="text-sm text-blue-600 mt-2">Processing image...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium">
            Event Title *
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
            Event Type *
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
            <option value="Nightlife">Nightlife</option>
            <option value="Business">Business</option>
            <option value="Performing Arts">Performing Arts</option>
            <option value="Food & Drink">Food & Drink</option>
            <option value="Holidays">Holidays</option>
            <option value="Dating">Dating</option>
            <option value="Hobbies">Hobbies</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your event and organiser details like phone no. and email." 
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block mb-1 font-medium">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block mb-1 font-medium">
            Time *
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
          Location *
        </label>
        <div className="flex items-center">
          <div className="flex flex-1">
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
          {(formData.latitude || formData.longitude) && (
            <button
              type="button"
              onClick={resetLocation}
              className="ml-2 bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
              title="Clear location data"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>
        {isReverseGeocoding && <p className="text-sm text-gray-500 mt-1">Getting address...</p>}
      </div>
      
      {(formData.latitude && formData.longitude) && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div>Latitude: {formData.latitude}</div>
          <div>Longitude: {formData.longitude}</div>
        </div>
      )}
      
      <button 
        type="button"
        onClick={() => setShowMap(!showMap)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm w-full md:w-auto"
      >
        {showMap ? 'Hide Map' : 'Show Map'}
      </button>
      
      {showMap && (
        <div className="border rounded p-2">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Set Exact Location</h3>
            <p className="text-sm text-gray-600 mb-2">
              Click anywhere on the map to update location
            </p>
          </div>
          
          <div className="h-64 bg-gray-100 rounded">
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
              {formData.latitude && formData.longitude && (
                <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
              )}
              <UpdateMapView center={center} />
              <LocationMarker setCoordinates={setCoordinates} />
            </MapContainer>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Note: Map data © OpenStreetMap contributors
          </p>
        </div>
      )}

      <div>
        <label htmlFor="organizer" className="block mb-1 font-medium">
          Organizer *
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
            Price *
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
              required
              className="w-full pl-7 px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting || isProcessingImage}
        className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium ${
          (isSubmitting || isProcessingImage) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Creating Event...' : 'Create Event'}
      </button>
    </form>
  );
}