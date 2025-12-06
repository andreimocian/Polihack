const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const safePlaceSchema = mongoose.Schema({
    lat: {
    type: Number,
    required: [true, 'A report must have a latitude'],
  },
  lng: {
    type: Number,
    required: [true, 'A report must have a longitude'],
  },
  name: {
    type: String,
    required: false
  },
  id: {
    type: String,
    required: false
  }
});

userSchema.plugin(findOrCreate);
const SafePlace = mongoose.model('safePlace', safePlaceSchema);

module.exports = SafePlace;