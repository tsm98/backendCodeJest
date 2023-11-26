const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  utEid: {
    type: String,
  },
  confirmPassword: {
    type: String,
    required: true,
  },

  profileImage: {
    type: String, // Storing the Base64 string
  },
});

module.exports = User = mongoose.model("user", UserSchema);
