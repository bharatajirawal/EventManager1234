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
    if (!req.body.organizer) {
      return res.status(400).json({ message: "Organizer email is required" })
    }
    const { accessToken } = req.body
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    // console.log("decoded", decoded)

    const eventData = {
      ...req.body,
      organizer: req.body.organizer, // This should be the email
      eventImage: req.file ? `/uploads/events/${req.file.filename}` : null,
      price: req.body.isFree === "true" ? null : Number.parseFloat(req.body.price),
      isFree: req.body.isFree === "true",
      email: decoded._id,
    }

    const event = new Event(eventData)
    await event.save()
    // console.log(event)
    res.status(201).json(event)
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: "Error creating event", error: error.message })
  }
})
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
