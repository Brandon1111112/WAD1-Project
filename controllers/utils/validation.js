const mongoose = require("mongoose");

// Reusable validators
const isMissingText = (v) =>
  v == null || (typeof v === "string" && v.trim() === "");
const isMissingNumber = (v) => v == null || v === "" || Number.isNaN(Number(v));
const isInvalidId = (id) =>
  isMissingText(id) || !mongoose.Types.ObjectId.isValid(id);

module.exports = { isMissingText, isMissingNumber, isInvalidId };
