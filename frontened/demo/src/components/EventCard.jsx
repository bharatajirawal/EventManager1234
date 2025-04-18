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
      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-2">{event.date}</p>
      <p className="text-gray-600 mb-4">{event.location}</p>
      <Link to={`/events/${id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        View Details
      </Link>
    </div>
  );
};

export default EventCard;
