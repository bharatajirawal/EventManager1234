import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const EventCard = ({ event }) => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <img className="w-full h-48 object-cover mb-4" src={
    event.eventImage

      ? event.eventImage.startsWith('http') 
        ? event.eventImage  // Already a full URL (Cloudinary)
        : `https://eventmanager1234-1.onrender.com/${event.eventImage}`  // Local path
      : "https://imgs.search.brave.com/SDmMp6QK8BpnygU8TIA6Gj8OpfrwxZ5xomIl51gjqhQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9keWwz/NDdoaXd2M2N0LmNs/b3VkZnJvbnQubmV0/L2FwcC91cGxvYWRz/LzIwMjUvMDMvNTMx/Mzk5Njk0MjRfNTg4/YzAyZmJkY19vLXNj/YWxlZC5qcGc"  // Fallback
  }alt="" />
      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-2">{new Date(event.date).toLocaleDateString(
        "en-US",  
        { year: "numeric", month: "long", day: "numeric" }
      )}</p>
      <p className="text-gray-600 mb-4">{event.location}</p>
      <Link to={`/events/${event._id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        View Details
      </Link>
    </div>
  );
};

export default EventCard;
