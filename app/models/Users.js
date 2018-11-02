var mongoose = require('mongoose')
// Define collection and schema for users

var users = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId
  },

  email: {
    type: String
  },

  password: {
    type: String
  }
},

  {
    collection: 'users'
  }
)

module.exports = mongoose.model('Users', users);