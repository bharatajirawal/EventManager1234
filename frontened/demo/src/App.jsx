import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/Eventdetails.jsx";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./pages/ProtectedRoute";
import EventEditPage from "./pages/EventEditPage";
import { AuthProvider } from "./context/AuthContext";
import MyEvents from "./pages/MyEvents.jsx";

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/create-event" element={<CreateEvent />} />
            </Route>
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/myevents" element={<MyEvents />} />
            <Route path="/events/edit/:id" element={<EventEditPage />} />

          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </div>
    </AuthProvider>
  );
}
export default App;