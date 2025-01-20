const express = require("express")
const router = express.Router()
const Event = require("../Models/Events")

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
    res.json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.json(event)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new event
router.post("/", async (req, res) => {
  const event = new Event(req.body)
  try {
    const newEvent = await event.save()
    res.status(201).json(newEvent)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update an event
router.patch("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.json(event)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete an event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.json({ message: "Event deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router

