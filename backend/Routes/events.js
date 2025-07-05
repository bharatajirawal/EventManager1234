const express = require("express")
const router = express.Router()
const Event = require("../Models/Events")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

// Cloudinary setup
const multer = require("multer")
const { storage, cloudinary } = require("../Middlewares/cloudinaryConfig.js")
const upload = multer({ storage })

// Get all events
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find()
    res.json(events)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error fetching events" })
  }
})

// Search and filter events
router.get("/events/search", async (req, res) => {
  try {
    const { query, type, location, date, minPrice, maxPrice, isFree } = req.query
    const filter = {}

    if (query) {
      filter.$or = [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }]
    }
    if (type) filter.type = type
    if (location) filter.location = { $regex: location, $options: "i" }
    if (date) filter.date = { $gte: new Date(date) }
    if (minPrice || maxPrice || isFree === "true") {
      if (isFree === "true") {
        filter.isFree = true
      } else {
        filter.price = {}
        if (minPrice) filter.price.$gte = Number(minPrice)
        if (maxPrice) filter.price.$lte = Number(maxPrice)
      }
    }

    const events = await Event.find(filter)
    res.json(events)
  } catch (error) {
    console.error("Error searching events:", error)
    res.status(500).json({ message: "Error searching events", error: error.message })
  }
})

// Get events filtered by organizer email
router.get("/events/filtered", async (req, res) => {
  try {
    const { accessToken } = req.query
    if (!accessToken) {
      return res.status(401).json({ message: "Authentication required" })
    }
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    const events = await Event.find({ email: decoded._id })

    res.json(events)
    console.log(events);
    console.log(events[0].email);
  } catch (error) {
    console.error(error)
    res.status(401).json({ message: "Authentication failed or error fetching events" })
  }
})

// Create event
router.post("/events", upload.single("eventImage"), async (req, res) => {
  try {
    console.log("=== EVENT CREATION START ===");
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    console.log("File received:", req.file ? "Yes" : "No");
    console.log("Content-Type:", req.headers['content-type']);

    // Check if organizer exists
    if (!req.body.organizer) {
      console.log("Missing organizer field");
      return res.status(400).json({ 
        message: "Organizer is required",
        receivedFields: Object.keys(req.body)
      });
    }

    // Get access token
    const accessToken = req.body.accessToken || 
                       req.query.accessToken || 
                       req.headers.authorization?.split(" ")[1];
    
    if (!accessToken) {
      console.log("No access token provided");
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("Verifying JWT token...");
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("Token verified successfully:", decoded);

    // Check database connection
    if (!mongoose.connection.readyState) {
      console.log("Database not connected");
      return res.status(500).json({ message: "Database connection error" });
    }

    const eventData = {
      ...req.body,
      eventImage: req.file ? req.file.path : null,
      price: req.body.isFree === "true" ? null : Number(req.body.price),
      isFree: req.body.isFree === "true",
      email: decoded._id
    };

    console.log("Creating event with data:", eventData);

    const event = new Event(eventData);
    await event.save();
    
    console.log("Event created successfully:", event._id);
    res.status(201).json(event);

  } catch (error) {
    console.error("=== ERROR OCCURRED ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid authentication token",
        error: error.message 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Authentication token expired",
        error: error.message 
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        error: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate entry",
        error: error.message
      });
    }

    // Generic server error
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
});

// Get single event
router.get("/events/:id", async (req, res) => {
  try {
    const { accessToken } = req.query
    const event = await Event.findById(req.params.id)

    if (!event) return res.status(404).json({ message: "Event not found" })

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
        const isOrganizer = event.email.equals(decoded._id)
        return res.json({ ...event.toObject(), isOrganizer })
      } catch (error) {
        return res.json(event)
      }
    }
    res.json(event)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error fetching event" })
  }
})

// Update event
router.patch("/events/:id", upload.single("eventImage"), async (req, res) => {
  try {
    const { accessToken } = req.body
    if (!accessToken) return res.status(401).json({ message: "Authentication required" })

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    const event = await Event.findById(req.params.id)
    if (!event) return res.status(404).json({ message: "Event not found" })

    if (!event.email.equals(decoded._id)) return res.status(403).json({ message: "Unauthorized" })

    const eventData = { ...req.body }
    if (req.file) eventData.eventImage = req.file.path
    if (eventData.isFree !== undefined) {
      eventData.isFree = eventData.isFree === "true"
      eventData.price = eventData.isFree ? null : Number(eventData.price || 0)
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, eventData, {
      new: true,
      runValidators: true,
    })

    res.json(updatedEvent)
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: "Error updating event", error: error.message })
  }
})

// Delete event
router.delete("/events/:id", async (req, res) => {
  try {
    const { accessToken } = req.body
    if (!accessToken) return res.status(401).json({ message: "Authentication required" })

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    const event = await Event.findById(req.params.id)

    if (!event) return res.status(404).json({ message: "Event not found" })
    if (!event.email.equals(decoded._id)) return res.status(403).json({ message: "Unauthorized" })

    // Delete the image from Cloudinary if it exists
    if (event.eventImage) {
      try {
        const publicId = event.eventImage.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(`eventhub_events/${publicId}`)
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError)
      }
    }

    await Event.findByIdAndDelete(req.params.id)
    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: "Error deleting event", error: error.message })
  }
})

module.exports = router
