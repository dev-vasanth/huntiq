import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keywordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Keyword', required: true },
  keywordText: { type: String },
  keywordType: { type: String, enum: ['own', 'competitor'], default: 'own' },

  // Reddit post data
  redditId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  url: { type: String, required: true },
  permalink: { type: String },
  subreddit: { type: String, required: true },
  author: { type: String },
  upvotes: { type: Number, default: 0 },
  numComments: { type: Number, default: 0 },
  redditCreatedAt: { type: Date },

  // Scoring & Analysis
  intentScore: { type: Number, default: 0, min: 0, max: 100 },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  intentSignals: [{ type: String }], // signals detected

  // Status
  status: {
    type: String,
    enum: ['new', 'saved', 'replied', 'dismissed'],
    default: 'new',
  },

  // Reply tracking
  repliedAt: { type: Date },
  replyContent: { type: String },
}, { timestamps: true });

leadSchema.index({ userId: 1, redditId: 1 }, { unique: true });
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, intentScore: -1 });
leadSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
