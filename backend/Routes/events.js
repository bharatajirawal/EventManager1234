const express = require('express');
const router = express.Router();
const Event = require('../Models/Events');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/events';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get events with organizer filter
router.get('/users/events', async (req, res) => {
  try {
    const filter = {};
    if (req.query.organizer) {
      filter.organizer = req.query.organizer;
    }
    
    const events = await Event.find(filter);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get all events (public endpoint)
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get single event
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Create event (with organizer field)
router.post('/events', upload.single('eventImage'), async (req, res) => {
  try {
    if (!req.body.organizer) {
      return res.status(400).json({ message: 'Organizer email is required' });
    }

    const eventData = {
      ...req.body,
      organizer: req.body.organizer,
      eventImage: req.file ? `/uploads/events/${req.file.filename}` : null,
      price: req.body.isFree === 'true' ? null : parseFloat(req.body.price),
      isFree: req.body.isFree === 'true'
    };

    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating event', error: error.message });
  }
});

// Update event
router.patch('/events/:id', upload.single('eventImage'), async (req, res) => {
  try {
    const currentEvent = await Event.findById(req.params.id);
    if (!currentEvent) return res.status(404).json({ message: 'Event not found' });

    const eventData = { ...req.body };
    
    if (req.file) {
      eventData.eventImage = `/uploads/events/${req.file.filename}`;
      if (currentEvent.eventImage) {
        const oldImagePath = path.join(__dirname, '..', currentEvent.eventImage.replace('/', ''));
        fs.existsSync(oldImagePath) && fs.unlinkSync(oldImagePath);
      }
    }

    if (eventData.price !== undefined) {
      eventData.price = eventData.isFree ? null : parseFloat(eventData.price);
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating event', error: error.message });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.eventImage) {
      const imagePath = path.join(__dirname, '..', event.eventImage.replace('/', ''));
      fs.existsSync(imagePath) && fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting event', error: error.message });
  }
});

module.exports = router;