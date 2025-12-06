const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: String,
  type: {
    type: String,
    required: [true, 'A report must have a disaster type'],
    enum: ['blocked_road', 'flood', 'landslide', 'earthquake', 'wildfire', 'hurricane', 'tornado', 'other'],
  },
  description: String,
  lat: {
    type: Number,
    required: [true, 'A report must have a latitude'],
  },
  lng: {
    type: Number,
    required: [true, 'A report must have a longitude'],
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resolved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;