import { useState } from "react"
import toast from "react-hot-toast"

export default function CreateEventForm() {
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
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:8080/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        toast.success("Event created successfully!")
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
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to create event")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred while creating the event")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block mb-1">
          Event Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="description" className="block mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        ></textarea>
      </div>
      <div>
        <label htmlFor="date" className="block mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="time" className="block mb-1">
          Time
        </label>
        <input
          type="time"
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="location" className="block mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="organizer" className="block mb-1">
          Organizer
        </label>
        <input
          type="text"
          id="organizer"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="type" className="block mb-1">
          Event Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
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
      <div>
        <label className="flex items-center">
          <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="mr-2" />
          Free Event
        </label>
      </div>
      {!formData.isFree && (
        <div>
          <label htmlFor="price" className="block mb-1">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Create Event
      </button>
    </form>
  )
}

