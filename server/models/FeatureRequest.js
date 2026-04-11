import mongoose from 'mongoose';

const featureRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userEmail: String,
  userPlan: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['feature', 'ui', 'integration', 'bug', 'other'], default: 'feature' },
  status: { type: String, enum: ['new', 'reviewing', 'planned', 'completed', 'declined'], default: 'new' },
}, { timestamps: true });

export default mongoose.model('FeatureRequest', featureRequestSchema);
