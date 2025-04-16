const express = require("express")
const router = express.Router()
const Event = require("../Models/Events")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const UserModel = require("../Models/User")
const mongoose = require("mongoose")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/events"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Get all events (public endpoint)
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find()
    res.json(events)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error fetching events" })
  }
})

// Search and filter events - IMPORTANT: This route must come before the /events/:id route
router.get("/events/search", async (req, res) => {
  try {
    const { query, type, location, date, minPrice, maxPrice, isFree } = req.query
    const filter = {}

    // Text search (searches in title and description)
    if (query) {
      filter.$or = [{ title: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }]
    }

    // Filter by event type
    if (type) {
      filter.type = type
    }

    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: "i" }
    }

    // Filter by date (events on or after this date)
    if (date) {
      const searchDate = new Date(date)
      filter.date = { $gte: searchDate }
    }

    if (minPrice || maxPrice || isFree === "true") {
      if (isFree === "true") {
        filter.isFree = true
      } else {
        filter.price = {}
        if (minPrice) filter.price.$gte = Number.parseFloat(minPrice)
        if (maxPrice) filter.price.$lte = Number.parseFloat(maxPrice)
      }
    }

    console.log("Search filter:", filter)
    const events = await Event.find(filter)
    console.log(`Found ${events.length} events matching criteria`)
    res.json(events)
  } catch (error) {
    console.error("Error searching events:", error)
    res.status(500).json({ message: "Error searching events", error: error.message })
  }
})

// Get events filtered by organizer email
router.get("/events/filtered", async (req, res) => {
  try {
    const { accessToken } = req.query // ✅ use req.query for GET
    console.log(accessToken)

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)

    const events = await Event.find({
      email: new mongoose.Types.ObjectId(decoded._id),
    })

    console.log(events)
    res.json(events)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error fetching events" })
  }
})

// Get single event - This must come AFTER the more specific routes


// Create event with organizer email
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
// Get single event with organizer verification
router.get("/events/:id", async (req, res) => {
  try {
    const { accessToken } = req.query;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        const isOrganizer = event.email.equals(decoded._id);
        return res.json({
          ...event.toObject(),
          isOrganizer
        });
      } catch (error) {
        return res.json(event);
      }
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching event" });
  }
});

// Update event with organizer verification
router.patch("/events/:id", upload.single("eventImage"), async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const event = await Event.findById(req.params.id);
    console.log(event);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Verify the user is the organizer
    if (!event.email.equals(decoded._id)) {
      return res.status(403).json({ message: "Unauthorized to edit this event" });
    }

    const eventData = { ...req.body };

    if (req.file) {
      eventData.eventImage = `/uploads/events/${req.file.filename}`;
      if (event.eventImage) {
        const oldImagePath = path.join(__dirname, "..", event.eventImage.replace("/", ""));
        fs.existsSync(oldImagePath) && fs.unlinkSync(oldImagePath);
      }
    }
    if (eventData.price !== undefined) {
      eventData.price = eventData.isFree ? null : Number.parseFloat(eventData.price);
    }
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, eventData, { 
      new: true,
      runValidators: true
    });
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(400).json({ message: "Error updating event", error: error.message });
  }
});


router.delete("/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) return res.status(404).json({ message: "Event not found" })

    if (event.eventImage) {
      const imagePath = path.join(__dirname, "..", event.eventImage.replace("/", ""))
      fs.existsSync(imagePath) && fs.unlinkSync(imagePath)
    }

    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(400).json({ message: "Error deleting event", error: error.message })
  }
})

module.exports = router
