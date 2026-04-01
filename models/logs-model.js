const mongoose = require("mongoose");

const logModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  action:{
    type: String,
    require: true,
  },
  category: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    require: false,
    default: null,
  },
  targetModel: {
    type: String,
    require: false,
    default: null,
  }

});

const Logs = mongoose.model("Logs", logModel, "logs");

Logs.createALog = function (userId, action, category, targetId, targetModel) {
  return Logs.create({userId:userId, action:action, category:category, targetId:targetId, targetModel:targetModel})
};

module.exports = Logs;