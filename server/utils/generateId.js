// utils/generateId.js
const Counter = require("../model/Counter");

async function generateId(type) {
  const year = new Date().getFullYear();

const counter = await Counter.findOneAndUpdate(
  { name: type },          // find by name, e.g. "report" or "user"
  { $inc: { seq: 1 } },    // increment sequence
  { new: true, upsert: true } // return updated doc, create if not exists
);


  const paddedSeq = counter.seq.toString().padStart(5, "0");
  return `${year}${paddedSeq}`;
}

module.exports = generateId;
