import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  goal: { type: String, enum: ['awareness', 'leads', 'sales', 'research', 'other'], default: 'leads' },
  color: { type: String, default: '#a855f7' },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Campaign', campaignSchema);
