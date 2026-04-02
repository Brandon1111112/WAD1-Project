const mongoose = require("mongoose");

const logModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action:{
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  }

});

const Logs = mongoose.model("Logs", logModel, "logs");

Logs.createALog = function (userId, action, category, targetId, isDeleted) {
  return Logs.create({userId:userId, action:action, category:category, targetId:targetId, isDeleted:isDeleted})
};

module.exports = Logs;