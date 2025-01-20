const mongoose = require("mongoose")

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  organizer: { type: String, required: true },
  type: { type: String, required: true },
  isFree: { type: Boolean, default: true },
  price: { type: Number },
})
module.exports = mongoose.model("Event", EventSchema)
