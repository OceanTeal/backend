import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { type: String, required: true },
  hours: { type: Number, required: true },
  tags: [{ type: String }],
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
})

const activityModel = mongoose.model('activity', activitySchema)

export default activityModel
