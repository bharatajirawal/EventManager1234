const express = require('express');
const router = express.Router();
const Event = require('../Models/Events');

// Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get a single event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
    } else {
      res.json(event);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Create a new event
router.post('/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating event' });
  }
});

// Update an event
router.patch('/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true });
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
    } else {
      res.json(event);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating event' });
  }
});

// Delete an event
router.delete('/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Event.findByIdAndDelete(id);
    res.status(204).json({ message: 'Event deleted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting event' });
  }
});

module.exports = router;