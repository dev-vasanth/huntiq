import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keyword: { type: String, required: true, trim: true },
  subreddits: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  intentSignals: [{ type: String }],
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  type: { type: String, enum: ['own', 'competitor'], default: 'own' },
  totalLeads: { type: Number, default: 0 },
  lastScanned: { type: Date },
}, { timestamps: true });

keywordSchema.index({ userId: 1, keyword: 1 });

export default mongoose.model('Keyword', keywordSchema);
