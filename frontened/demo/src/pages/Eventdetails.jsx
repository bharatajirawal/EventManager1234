import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import EventCard from "../components/EventCard";

export default function EventDetails() {
  const [events, setEvent] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else {
          toast.error("Failed to fetch event details");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while fetching event details");
      }
    };

    fetchEvent();
  }, [id]);

  if (!events) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <EventCard event={events} />
    </div>
  );
  
}
