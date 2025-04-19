"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import EventCard from "../components/EventCard"
import { Search, MapPin, Filter, Calendar, DollarSign, X } from "lucide-react"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSearchResults, setIsSearchResults] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [eventTypes, setEventTypes] = useState([])

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [filters, setFilters] = useState({
    type: "",
    date: "",
    minPrice: "",
    maxPrice: "",
    isFree: false,
  })

  useEffect(() => {
    fetchEvents()
    fetchEventTypes()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://eventmanager1234-1.onrender.com/users/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
        setIsSearchResults(false)
      } else {
        toast.error("Failed to fetch events")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred while fetching events")
    } finally {
      setLoading(false)
    }
  }

  const fetchEventTypes = async () => {
    try {
      const response = await fetch("https://eventmanager1234-1.onrender.com/users/events")
      if (response.ok) {
        const events = await response.json()
        // Extract unique event types
        const types = [...new Set(events.map((event) => event.type))]
        setEventTypes(types)
      }
    } catch (error) {
      console.error("Error fetching event types:", error)
    }
  }

  const handleSearch = async (e) => {
    e?.preventDefault()

    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      if (searchQuery.trim()) {
        queryParams.append("query", searchQuery.trim())
      }

      if (locationQuery.trim()) {
        queryParams.append("location", locationQuery.trim())
      }

      if (filters.type) {
        queryParams.append("type", filters.type)
      }

      if (filters.date) {
        queryParams.append("date", filters.date)
      }

      if (filters.minPrice) {
        queryParams.append("minPrice", filters.minPrice)
      }

      if (filters.maxPrice) {
        queryParams.append("maxPrice", filters.maxPrice)
      }

      if (filters.isFree) {
        queryParams.append("isFree", "true")
      }

      const response = await fetch(`https://eventmanager1234-1.onrender.com/users/events/search?${queryParams.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setEvents(data)
        setIsSearchResults(true)
      } else {
        toast.error("Failed to search events")
      }
    } catch (error) {
      console.error("Error searching events:", error)
      toast.error("Error occurred while searching")
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      type: "",
      date: "",
      minPrice: "",
      maxPrice: "",
      isFree: false,
    })
    setSearchQuery("")
    setLocationQuery("")
    fetchEvents()
  }

  const categories = [
    { icon: "🎵", label: "Music" },
    { icon: "🌙", label: "Nightlife" },
    { icon: "🎭", label: "Performing Arts" },
    { icon: "🎉", label: "Holidays" },
    { icon: "❤️", label: "Dating" },
    { icon: "🎮", label: "Hobbies" },
    { icon: "💼", label: "Business" },
    { icon: "🍽️", label: "Food & Drink" },
  ]

  const handleCategoryClick = (category) => {
    setFilters({ ...filters, type: category.label })
    setTimeout(handleSearch, 0)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section - Simplified */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find your next experience</h1>
          <p className="text-xl mb-6">Discover events that match your interests</p>

          {/* Integrated Search Bar - Eventbrite Style */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row">
            <div className="flex-1 relative border-b md:border-b-0 md:border-r border-gray-200 p-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="search"
                placeholder="Search events"
                className="w-full pl-10 pr-3 py-2 text-gray-700 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 relative border-b md:border-b-0 md:border-r border-gray-200 p-2">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Location"
                className="w-full pl-10 pr-3 py-2 text-gray-700 focus:outline-none"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <div className="p-2 flex">
              <button
                onClick={handleSearch}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-6 rounded transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar - Horizontal Eventbrite Style */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex flex-wrap items-center p-4 gap-4">
            <div className="flex items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                  showFilters ? "bg-gray-100 border-gray-300" : "border-gray-300"
                }`}
              >
                <Filter size={16} />
                <span>Filters</span>
                {Object.values(filters).some((val) => val && val !== "") && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-500 rounded-full">
                    {Object.values(filters).filter((val) => val && val !== "").length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Date:</span>
              <select
                value={filters.date}
                onChange={(e) => {
                  setFilters({ ...filters, date: e.target.value })
                  setTimeout(handleSearch, 0)
                }}
                className="px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">Any date</option>
                <option value={new Date().toISOString().split("T")[0]}>Today</option>
                <option value={new Date(Date.now() + 86400000).toISOString().split("T")[0]}>Tomorrow</option>
                <option value={new Date(Date.now() + 604800000).toISOString().split("T")[0]}>This week</option>
                <option value={new Date(Date.now() + 2592000000).toISOString().split("T")[0]}>This month</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Type:</span>
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters({ ...filters, type: e.target.value })
                  setTimeout(handleSearch, 0)
                }}
                className="px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">All types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Price:</span>
              <select
                value={filters.isFree ? "free" : filters.minPrice || filters.maxPrice ? "paid" : ""}
                onChange={(e) => {
                  if (e.target.value === "free") {
                    setFilters({ ...filters, isFree: true, minPrice: "", maxPrice: "" })
                  } else if (e.target.value === "paid") {
                    setFilters({ ...filters, isFree: false, minPrice: "1", maxPrice: "" })
                  } else {
                    setFilters({ ...filters, isFree: false, minPrice: "", maxPrice: "" })
                  }
                  setTimeout(handleSearch, 0)
                }}
                className="px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">Any price</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {(isSearchResults ||
              Object.values(filters).some((val) => val && val !== "") ||
              searchQuery ||
              locationQuery) && (
              <button
                onClick={resetFilters}
                className="ml-auto text-pink-500 text-sm flex items-center gap-1 hover:text-pink-600"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar size={16} className="mr-2" />
                    Specific Date
                  </label>
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-md"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign size={16} className="mr-2" />
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, isFree: false })}
                      disabled={filters.isFree}
                      className="w-full rounded-md"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, isFree: false })}
                      disabled={filters.isFree}
                      className="w-full rounded-md"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.isFree}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            isFree: e.target.checked,
                            minPrice: e.target.checked ? "" : filters.minPrice,
                            maxPrice: e.target.checked ? "" : filters.maxPrice,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Free events only</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} className="bg-pink-500 hover:bg-pink-600 text-white">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((category) => (
              <div
                key={category.label}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-center text-gray-700">{category.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{isSearchResults ? "Events for you" : "Popular Events"}</h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                {isSearchResults ? "No events match your search" : "No events available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {isSearchResults
                  ? "Try adjusting your search criteria or filters"
                  : "Check back later for upcoming events"}
              </p>
              {isSearchResults && (
                <Button onClick={resetFilters} className="bg-pink-500 text-white hover:bg-pink-600">
                  View All Events
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event._id || event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
