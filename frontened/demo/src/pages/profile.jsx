import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Edit, Trash2, Plus, Calendar, MapPin, DollarSign, Eye, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MyEvents from "./MyEvents";
export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    // Just set loading to false after component mounts
    // Since we're moving events to a separate component
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              selectedTab === "profile"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setSelectedTab("profile")}
          >
            User Profile
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              selectedTab === "events"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
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
                {user?.name?.charAt(0).toUpperCase() || <User size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
                <p className="text-gray-500">{user?.email || "email@example.com"}</p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user?.name || "Not available"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || "Not available"}</p>
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
          <MyEvents user={user} />
        )}
      </div>
    </div>
  );
}