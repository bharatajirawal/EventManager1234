import CreateEventForm from "../components/CreateEventForm"

export default function CreateEvent() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Create a New Event</h1>
      <CreateEventForm />
    </div>
  )
}

