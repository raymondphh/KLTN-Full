import mongoose from "mongoose";

const ThesisSchema = new mongoose.Schema(
  {
    semester: { type: String, required: true },
    year: { type: String, required: true },
    thesisName: { type: String, required: true, trim: true },
    instructorCode: { type: String, required: true, index: true },
    instructorName: { type: String, required: true },
    instructorPhone: String,
    studentQuantity: { type: Number, required: true, min: 1 },
    require: String,
    members: {
      type: [String],
      default: [],
      index: true, // tăng tốc truy vấn getRegisteredThesisId (Thesis.findOne({ members: code }))
    },
  },
  { timestamps: true },
);

ThesisSchema.index({ semester: 1, year: 1 });

const Thesis = mongoose.model("Thesis", ThesisSchema);
export default Thesis;
