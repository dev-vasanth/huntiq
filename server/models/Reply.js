import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isAI: { type: Boolean, default: false },
  tone: { type: String, enum: ['professional', 'friendly', 'casual', 'direct'], default: 'professional' },
  isSent: { type: Boolean, default: false },
  sentAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Reply', replySchema);
