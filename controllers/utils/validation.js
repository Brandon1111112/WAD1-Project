const mongoose = require("mongoose");

// Reusable validators
const isMissingText = (v) =>
  v == null || (typeof v === "string" && v.trim() === "");
const isMissingNumber = (v) => v == null || v === "" || Number.isNaN(Number(v));
const isInvalidId = (id) =>
  isMissingText(id) || !mongoose.Types.ObjectId.isValid(id);
const convertToNum = (numStr) => {
  let arraySplit = numStr.split(" ");
  return Number(arraySplit[0]);
};

module.exports = { isMissingText, isMissingNumber, isInvalidId, convertToNum };
